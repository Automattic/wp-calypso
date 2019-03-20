const BasicEvaluatedExpression = require( 'webpack/lib/BasicEvaluatedExpression' );

// Check that the given call expression is `config.isEnabled( 'flag' )`
// and return the `flag` literal value.
const isConfigIsEnabledExpr = expr =>
	expr.callee.type === 'MemberExpression' &&
	expr.callee.object.type === 'Identifier' &&
	expr.callee.object.name === 'config' &&
	expr.callee.property.type === 'Identifier' &&
	expr.callee.property.name === 'isEnabled' &&
	expr.arguments.length === 1 &&
	expr.arguments[ 0 ].type === 'Literal'
		? expr.arguments[ 0 ].value
		: null;

const moduleTypes = [ 'javascript/auto', 'javascript/dynamic', 'javascript/esm' ];

class ConfigFlagPlugin {
	constructor( flags ) {
		this.flags = flags;
	}

	apply( compiler ) {
		// replace the `config.isEnabled( 'flag' )` expression with the flag's boolean value
		const handleExpr = expr => {
			const flag = isConfigIsEnabledExpr( expr );
			if ( flag && Object.keys( this.flags ).includes( flag ) ) {
				return new BasicEvaluatedExpression()
					.setBoolean( this.flags[ flag ] )
					.setRange( expr.range );
			}
		};

		// inspect all function/method calls
		const handleParser = parser => {
			parser.hooks.evaluate.for( 'CallExpression' ).tap( 'ConfigFlagPlugin', handleExpr );
		};

		// inspect all JS modules
		const handleCompilation = ( compilation, { normalModuleFactory } ) => {
			moduleTypes.forEach( moduleType => {
				normalModuleFactory.hooks.parser.for( moduleType ).tap( 'ConfigFlagPlugin', handleParser );
			} );
		};

		compiler.hooks.compilation.tap( 'ConfigFlagPlugin', handleCompilation );
	}
}

module.exports = ConfigFlagPlugin;
