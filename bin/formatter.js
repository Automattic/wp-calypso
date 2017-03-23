const fixableRules = [
	'array-bracket-spacing',
	'arrow-body-style',
	'arrow-parens',
	'arrow-spacing',
	'block-spacing',
	'brace-style',
	'capitalized-comments',
	'comma-dangle',
	'comma-spacing',
	'comma-style',
	'computed-property-spacing',
	'curly',
	'dot-location',
	'dot-notation',
	'eol-last',
	'eqeqeq',
	'func-call-spacing',
	'generator-star-spacing',
	'indent',
	'jsx-quotes',
	'key-spacing',
	'keyword-spacing',
	'linebreak-style',
	'lines-around-comment',
	'lines-around-directive',
	'new-parens',
	'newline-after-var',
	'newline-before-return',
	'no-else-return',
	'no-extra-bind',
	'no-extra-boolean-cast',
	'no-extra-label',
	'no-extra-parens',
	'no-extra-semi',
	'no-floating-decimal',
	'no-implicit-coercion',
	'no-lonely-if',
	'no-multi-spaces',
	'no-multiple-empty-lines',
	'no-regex-spaces',
	'no-trailing-spaces',
	'no-undef-init',
	'no-unneeded-ternary',
	'no-unsafe-negation',
	'no-unused-labels',
	'no-useless-computed-key',
	'no-useless-rename',
	'no-useless-return',
	'no-var',
	'no-whitespace-before-property',
	'nonblock-statement-body-position',
	'object-curly-newline',
	'object-curly-spacing',
	'object-property-newline',
	'object-shorthand',
	'one-var-declaration-per-line',
	'operator-assignment',
	'operator-linebreak',
	'padded-blocks',
	'prefer-arrow-callback',
	'prefer-const',
	'prefer-numeric-literals',
	'prefer-spread',
	'prefer-template',
	'quote-props',
	'quotes',
	'rest-spread-spacing',
	'semi',
	'semi-spacing',
	'sort-imports',
	'space-before-blocks',
	'space-before-function-paren',
	'space-in-parens',
	'space-infix-ops',
	'space-unary-ops',
	'spaced-comment',
	'strict',
	'template-curly-spacing',
	'template-tag-spacing',
	'unicode-bom',
	'wrap-iife',
	'wrap-regex',
	'yield-star-spacing',
	'yoda'
];

const isFixable = ( ruleId ) => {
	return fixableRules.includes(ruleId);
}

module.exports = ( results ) => {
	var results = results || [ ];

	var summary = results.reduce( ( seq, current ) => {

		current.messages.forEach( ( msg ) => {
			var logMessage = {
				filePath: current.filePath,
				ruleId: msg.ruleId,
				message: msg.message,
				line: msg.line,
				column: msg.column,
				source: msg.source
			};

			if ( isFixable(msg.ruleId) && msg.severity === 1 ) {
				logMessage.type = 'warning';
				seq.warnings.push( logMessage );
			}
			if ( isFixable(msg.ruleId) && msg.severity === 2 ) {
				logMessage.type = 'error';
				seq.errors.push( logMessage );
			}
		} );
		return seq;
	}, {
		errors: [],
		warnings: []
	} );

	if ( summary.errors.length > 0 || summary.warnings.length > 0 ) {
		var lines = summary.errors.concat( summary.warnings ).map( ( msg ) => {
			return '\n' + msg.ruleId + '\n  ' + msg.filePath + ':' + msg.line + ':' + msg.column;
		} ).join( '\n' );

		return lines + '\n';
	}
};
