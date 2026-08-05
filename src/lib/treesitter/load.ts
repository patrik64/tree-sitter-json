// Browser-side loader: boots the tree-sitter WASM runtime and fetches our
// hand-written JSON grammar from /static/wasm. Memoized — one runtime, one
// parser, shared by the whole page.
import { Parser, Language } from 'web-tree-sitter';
import coreWasmUrl from 'web-tree-sitter/web-tree-sitter.wasm?url';
import { base } from '$app/paths';

let instance: Promise<Parser> | undefined;

export function loadJsonParser(): Promise<Parser> {
	instance ??= init();
	return instance;
}

async function init(): Promise<Parser> {
	await Parser.init({ locateFile: () => coreWasmUrl });
	const json = await Language.load(`${base}/wasm/tree-sitter-json.wasm`);
	const parser = new Parser();
	parser.setLanguage(json);
	return parser;
}
