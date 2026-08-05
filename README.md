# json × tree-sitter

A SvelteKit demo that parses JSON in the browser with a tree-sitter grammar
written from scratch (`grammar/grammar.js`), compiled to WASM and loaded via
`web-tree-sitter`.

Type JSON on the left, watch the syntax tree update live on the right:

- per-keystroke reparse with parse time and node count
- ERROR / MISSING nodes shown in red in the tree, wavy-underlined in the source
- hover a tree node to highlight its source span; click to select it;
  the cursor position highlights its path in the tree
- "named only" toggle to hide anonymous tokens (`{`, `,`, `"`, …)
- sample loaders (one valid, one broken) and a modal showing the grammar source

Stack: SvelteKit 2, Svelte 5 (runes), Vite, Tailwind CSS v4, web-tree-sitter.
The app is fully client-side and builds to a static site (`adapter-static`,
`ssr = false`); the grammar wasm is served from `static/wasm/`.

## Prerequisites

- Node + pnpm
- [tree-sitter CLI](https://tree-sitter.github.io/tree-sitter/) (`cargo install tree-sitter-cli`)
- an [emsdk](https://github.com/emscripten-core/emsdk) checkout (only needed to
  rebuild the wasm after grammar changes) ... run `` ./emsdk install latest && ./emsdk activate latest``

## Setup & develop

```sh
pnpm install
cp .env.example .env     # set EMSDK_DIR to your emsdk checkout
pnpm run grammar:build   # generate parser.c + compile static/wasm/tree-sitter-json.wasm
pnpm run dev             # http://localhost:5173
```

## Grammar workflow

The grammar lives in `grammar/grammar.js` with corpus tests in
`grammar/test/corpus/*.txt`. `grammar/src/` and `static/wasm/` are generated
and gitignored.

```sh
pnpm run grammar:generate   # grammar.js -> grammar/src/parser.c
pnpm run grammar:test       # run the corpus tests
pnpm run grammar:wasm       # compile to static/wasm/tree-sitter-json.wasm (uses EMSDK_DIR)
pnpm run grammar:build      # generate + wasm in one go
```

Corpus expectations show named nodes only; regenerate them with
`cd grammar && tree-sitter test -u` after grammar changes, then review the diff.

## Production build

```sh
pnpm run build && pnpm run preview   # static site via adapter-static
```
