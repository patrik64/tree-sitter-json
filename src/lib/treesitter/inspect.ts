// Snapshots a web-tree-sitter tree into plain objects the UI can render.
// (Tree nodes live in WASM memory; copying them out keeps the Svelte side
// simple and lets us delete() trees as soon as we're done with them.)
import type { Node } from 'web-tree-sitter';

export interface DisplayNode {
	id: number;
	type: string;
	/** Field name this node occupies in its parent, e.g. "key". */
	field: string | null;
	named: boolean;
	/** UTF-16 code-unit offsets into the source string. */
	start: number;
	end: number;
	startPos: string;
	endPos: string;
	isError: boolean;
	isMissing: boolean;
	children: DisplayNode[];
}

export function buildDisplayTree(root: Node): DisplayNode {
	const cursor = root.walk();

	function build(): DisplayNode {
		const n = cursor.currentNode;
		const d: DisplayNode = {
			id: n.id,
			type: n.type,
			field: cursor.currentFieldName ?? null,
			named: n.isNamed,
			start: n.startIndex,
			end: n.endIndex,
			startPos: `${n.startPosition.row}:${n.startPosition.column}`,
			endPos: `${n.endPosition.row}:${n.endPosition.column}`,
			isError: n.isError || n.type === 'ERROR',
			isMissing: n.isMissing,
			children: []
		};
		if (cursor.gotoFirstChild()) {
			do {
				d.children.push(build());
			} while (cursor.gotoNextSibling());
			cursor.gotoParent();
		}
		return d;
	}

	const result = build();
	cursor.delete();
	return result;
}

export function countNodes(node: DisplayNode): number {
	return 1 + node.children.reduce((sum, c) => sum + countNodes(c), 0);
}

export function hasErrors(node: DisplayNode): boolean {
	return node.isError || node.isMissing || node.children.some(hasErrors);
}

/** Spans of ERROR and MISSING nodes, for underlining in the editor. */
export function errorRanges(node: DisplayNode): { start: number; end: number }[] {
	const ranges: { start: number; end: number }[] = [];
	function walk(n: DisplayNode) {
		if (n.isError || n.isMissing) {
			// A MISSING node is zero-width; widen it so the mark is visible.
			ranges.push({ start: n.start, end: Math.max(n.end, n.start + 1) });
			return;
		}
		n.children.forEach(walk);
	}
	walk(node);
	return ranges;
}

/** Root-to-leaf chain of nodes containing the given character index. */
export function pathAtIndex(root: DisplayNode, index: number): DisplayNode[] {
	const path: DisplayNode[] = [];
	let current: DisplayNode | undefined = root;
	while (current) {
		path.push(current);
		const named: DisplayNode | undefined = current.children.find(
			(c) => c.named && c.start <= index && index < c.end
		);
		current = named ?? current.children.find((c) => c.start <= index && index < c.end);
	}
	return path;
}
