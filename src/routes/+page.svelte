<script lang="ts">
	import { onMount } from 'svelte';
	import type { Parser } from 'web-tree-sitter';
	import { loadJsonParser } from '$lib/treesitter/load';
	import {
		buildDisplayTree,
		countNodes,
		errorRanges,
		hasErrors,
		pathAtIndex,
		type DisplayNode
	} from '$lib/treesitter/inspect';
	import { renderHighlights, type Span } from '$lib/highlight';
	import { VALID_SAMPLE, BROKEN_SAMPLE } from '$lib/samples';
	import JsonEditor from '$lib/components/JsonEditor.svelte';
	import TreeNode from '$lib/components/TreeNode.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import grammarSource from '../../grammar/grammar.js?raw';

	let parser = $state<Parser | null>(null);
	let source = $state(VALID_SAMPLE);
	let hovered = $state<DisplayNode | null>(null);
	let cursorIndex = $state<number | null>(null);
	let namedOnly = $state(true);
	let showGrammar = $state(false);
	let editor = $state<JsonEditor | undefined>();

	onMount(() => {
		loadJsonParser().then((p) => (parser = p));
	});

	// Live parse: every keystroke re-runs the WASM parser via this $derived.
	const parsed = $derived.by(() => {
		if (!parser) return null;
		const t0 = performance.now();
		const tree = parser.parse(source);
		if (!tree) return null;
		const ms = performance.now() - t0;
		const root = buildDisplayTree(tree.rootNode);
		tree.delete(); // free the WASM handle; the POJO snapshot is all we keep
		return { root, ms };
	});

	const valid = $derived(parsed ? !hasErrors(parsed.root) : null);
	const errors = $derived(parsed ? errorRanges(parsed.root) : []);
	const cursorPath = $derived(
		parsed && cursorIndex !== null ? pathAtIndex(parsed.root, cursorIndex) : []
	);
	const pathIds = $derived(new Set(cursorPath.map((n) => n.id)));

	const backdropHtml = $derived.by(() => {
		const spans: Span[] = errors.map((r) => ({ ...r, cls: 'err' }));
		if (hovered) spans.push({ start: hovered.start, end: hovered.end, cls: 'hl' });
		return renderHighlights(source, spans);
	});
</script>

<div class="mx-auto max-w-[100rem] px-4 pb-8">
	<div class="mb-4 flex flex-wrap items-center gap-3 select-none">
		{#if parsed}
			<span
				class="rounded-full px-3 py-1 text-sm font-semibold text-white {valid
					? 'bg-success-500'
					: 'bg-danger-500'}">{valid ? 'valid' : 'invalid'}</span
			>
			<span class="text-sm font-semibold text-gray-600">
				parsed in {parsed.ms.toFixed(2)} ms · {countNodes(parsed.root)} nodes
			</span>
		{:else}
			<span class="text-sm font-semibold text-gray-600">loading wasm parser…</span>
		{/if}

		<span class="grow"></span>

		<label class="flex items-center gap-1.5 text-sm font-semibold text-gray-600">
			<input type="checkbox" bind:checked={namedOnly} />
			named only
		</label>

		<button
			type="button"
			onclick={() => (source = VALID_SAMPLE)}
			class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm leading-5 font-medium text-gray-700 shadow-sm transition duration-150 ease-in-out hover:text-gray-500 focus:border-blue-300 focus:shadow-outline-blue focus:outline-none"
		>
			valid sample
		</button>
		<button
			type="button"
			onclick={() => (source = BROKEN_SAMPLE)}
			class="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-3 py-1.5 text-sm leading-5 font-medium text-white shadow-sm transition duration-150 ease-in-out hover:bg-red-500 focus:shadow-outline-red focus:outline-none"
		>
			broken sample
		</button>
		<button
			type="button"
			onclick={() => (showGrammar = true)}
			class="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-3 py-1.5 text-sm leading-5 font-medium text-white shadow-sm transition duration-150 ease-in-out hover:bg-primary-400 focus:shadow-outline-green focus:outline-none"
		>
			grammar
		</button>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<section class="flex h-[75vh] flex-col overflow-hidden rounded-lg bg-white shadow-lg">
			<h2 class="border-b border-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 select-none">
				source
			</h2>
			<JsonEditor bind:this={editor} bind:value={source} html={backdropHtml} onCursor={(i) => (cursorIndex = i)} />
		</section>

		<section class="flex h-[75vh] flex-col overflow-hidden rounded-lg bg-white shadow-lg">
			<h2 class="border-b border-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 select-none">
				syntax tree
			</h2>
			<div class="min-h-0 grow overflow-auto p-3">
				{#if parsed}
					<TreeNode
						node={parsed.root}
						{namedOnly}
						path={pathIds}
						onHover={(n) => (hovered = n)}
						onPick={(n) => editor?.select(n.start, n.end)}
					/>
				{/if}
			</div>
		</section>
	</div>
</div>

{#if showGrammar}
	<Modal onclose={() => (showGrammar = false)} maxWidth="sm:max-w-4xl">
		<h3 id="modal-headline" class="mb-3 text-lg font-semibold text-gray-900 select-none">
			grammar.js — json from scratch
		</h3>
		<pre
			class="max-h-[70vh] overflow-auto rounded-md bg-light-500 p-4 font-mono text-xs leading-relaxed text-gray-800">{grammarSource}</pre>
	</Modal>
{/if}
