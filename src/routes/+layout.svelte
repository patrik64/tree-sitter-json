<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>json × tree-sitter</title>
</svelte:head>

<div class="flex items-center p-2 select-none">
	<span class="font-semibold">json × tree-sitter</span>
</div>

{@render children()}
