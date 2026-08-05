<script lang="ts">
	import type { DisplayNode } from '$lib/treesitter/inspect';
	import TreeNode from './TreeNode.svelte';

	interface Props {
		node: DisplayNode;
		namedOnly: boolean;
		/** ids of the nodes on the root→cursor path */
		path: ReadonlySet<number>;
		onHover: (node: DisplayNode | null) => void;
		onPick: (node: DisplayNode) => void;
	}

	let { node, namedOnly, path, onHover, onPick }: Props = $props();

	const children = $derived(namedOnly ? node.children.filter((c) => c.named) : node.children);
</script>

<div>
	<button
		class="flex items-baseline gap-2 rounded px-1.5 font-mono text-[12.5px] leading-6 whitespace-nowrap select-none hover:bg-light-500 {path.has(
			node.id
		)
			? 'bg-primary-300'
			: ''}"
		onmouseenter={() => onHover(node)}
		onmouseleave={() => onHover(null)}
		onclick={() => onPick(node)}
	>
		{#if node.field}<span class="text-secondary-600">{node.field}:</span>{/if}
		{#if node.isError || node.isMissing}
			<span class="font-bold text-red-600">
				({node.isMissing ? `MISSING ${node.type}` : node.type})
			</span>
		{:else if node.named}
			<span class="text-tertiary-600">({node.type})</span>
		{:else}
			<span class="text-gray-500">"{node.type}"</span>
		{/if}
		<span class="text-[11px] text-gray-400">{node.start}–{node.end}</span>
	</button>
	{#if children.length > 0}
		<div class="ml-2 border-l border-gray-300 pl-3">
			{#each children as child (child.id)}
				<TreeNode node={child} {namedOnly} {path} {onHover} {onPick} />
			{/each}
		</div>
	{/if}
</div>
