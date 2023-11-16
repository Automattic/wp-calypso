/**
 * This rule factory will create an ESLint rule for each npm-package-json-lint rule
 * (see https://npmpackagejsonlint.org/docs/en/rules)
 */
const esquery = require( 'esquery' );
const { NpmPackageJsonLint } = require( 'npm-package-json-lint' );

const buildRules = () => {
	const npmPackageJsonLint = new NpmPackageJsonLint( {} );
	const rules = npmPackageJsonLint.rules.getRules();

	const eslintRules = {};

	for ( const ruleName of Object.keys( rules ) ) {
		eslintRules[ ruleName ] = {
			meta: {
				type: 'suggestion',
				fixable: 'code',
			},
			create: ( context ) => ( {
				Program: ( programNode ) => {
					const options = context.options?.[ 0 ] ?? {};
					const json = context.parserServices.getJSON();
					const rule = npmPackageJsonLint.rules.get( ruleName );

					// I think the second argument is just used for the report, so we can ignore it
					// (reports will be filtered later by ESlint)
					const result = rule.lint( json, 'error', options );
					if ( result !== null ) {
						// result.node is the name of the property that failed. We can search for that
						// property in the AST to get the node. This will help include the location of
						// the error in ESlint report
						const ruleNode = esquery(
							programNode,
							`Program > ObjectExpression > Property[key.value="${ result.node }"]`
						)[ 0 ];

						context.report( {
							message: result.lintMessage,
							node: ruleNode ?? programNode,
						} );
					}
				},
			} ),
		};
	}
	return eslintRules;
};

module.exports = buildRules;
