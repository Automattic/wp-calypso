const jsonESParser = require( 'eslint-plugin-json-es' ).parseForESLint;

module.exports = {
	parseForESLint: ( code, options ) => {
		/**
		 * We call the original parser so ESLint rules can apply. It will return a valid AST
		 * with the content of the JSON (https://www.npmjs.com/package/eslint-plugin-json-es).
		 *
		 * On top of that, we add a parser service to get the original JSON. This will be used by
		 * npm-package-json-lint rules.
		 */
		const parserResult = jsonESParser( code, options );

		parserResult.services.getJSONraw = () => code;

		let originalJSON = null;
		try {
			originalJSON = JSON.parse( code );
		} catch {
			// Error parsing JSON, it is not valid JSON (maybe it has comments)
		}
		parserResult.services.getJSON = () => originalJSON;

		return parserResult;
	},
};
