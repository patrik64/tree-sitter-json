export const VALID_SAMPLE = `{
  "meetup": "tree-sitter from scratch",
  "attendees": 42,
  "topics": ["grammars", "wasm", "sveltekit"],
  "speaker": {
    "name": "patrik",
    "confirmed": true,
    "rating": 4.9e0
  },
  "recording": null,
  "notes": "escape\\u00e9 \\"quotes\\" and\\nnewlines"
}`;

export const BROKEN_SAMPLE = `{
  "name": "oops",
  "count": ,
  "list": [1, 2,],
  "text": "unterminated
}`;
