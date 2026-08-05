#!/bin/sh
# Compiles the grammar to static/wasm/tree-sitter-json.wasm.
# Reads EMSDK_DIR from the environment or from .env in the repo root.
set -e

cd "$(dirname "$0")/.."

if [ -f .env ]; then
	set -a
	. ./.env
	set +a
fi

if [ -z "$EMSDK_DIR" ]; then
	echo "EMSDK_DIR is not set. Copy .env.example to .env and point it at your emsdk checkout." >&2
	exit 1
fi

if [ ! -f "$EMSDK_DIR/emsdk_env.sh" ]; then
	echo "No emsdk_env.sh found in EMSDK_DIR ($EMSDK_DIR)." >&2
	exit 1
fi

EMSDK_QUIET=1 . "$EMSDK_DIR/emsdk_env.sh"
cd grammar
exec tree-sitter build --wasm -o ../static/wasm/tree-sitter-json.wasm
