export const VALID_SAMPLE = `{
  "meetup": "incremental parsing with tree-sitter",
  "attendees": 72,
  "topics": ["grammars", "parsing", "c", "rust", "javascript"],
  "speaker": {
    "name": "patrik",
    "confirmed": true
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
