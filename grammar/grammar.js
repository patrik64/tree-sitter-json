/**
 * JSON grammar written from scratch, following the railroad diagrams
 * at https://www.json.org — whitespace (space, tab, newline, carriage
 * return) may appear between any pair of tokens.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
	name: 'json',

	// json.org "ws": skipped between any two tokens.
	extras: (_) => [/[ \t\n\r]/],

	rules: {
		// A JSON text is exactly one value.
		document: ($) => $._value,

		_value: ($) => choice($.object, $.array, $.string, $.number, $.true, $.false, $.null),

		object: ($) => seq('{', commaSep($.pair), '}'),

		pair: ($) => seq(field('key', $.string), ':', field('value', $._value)),

		array: ($) => seq('[', commaSep($._value), ']'),

		string: ($) => seq('"', optional($.string_content), '"'),

		// token.immediate: extras (whitespace) must not be skipped inside
		// a string. Control characters below U+0020 are forbidden raw.
		string_content: ($) =>
			repeat1(choice(token.immediate(prec(1, /[^"\\\u0000-\u001f]+/)), $.escape_sequence)),

		// \" \\ \/ \b \f \n \r \t or \uXXXX
		escape_sequence: (_) => token.immediate(/\\(["\\/bfnrt]|u[0-9a-fA-F]{4})/),

		// -? int frac? exp? — int has no leading zeros.
		number: (_) => {
			const int = /0|[1-9][0-9]*/;
			const frac = /\.[0-9]+/;
			const exp = /[eE][+-]?[0-9]+/;
			return token(seq(optional('-'), int, optional(frac), optional(exp)));
		},

		true: (_) => 'true',
		false: (_) => 'false',
		null: (_) => 'null',
	},
});

/** rule, rule, ... — possibly empty */
function commaSep(rule) {
	return optional(seq(rule, repeat(seq(',', rule))));
}
