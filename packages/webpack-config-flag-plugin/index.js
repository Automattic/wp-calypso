const BasicEvaluatedExpression = require( 'webpack/lib/BasicEvaluatedExpression' );

// Check that the given call expression is `config.isEnabled( 'flag' )` with
// `config` as the default export or namespace, and return the `flag` literal value.
const isCallOnDefaultOrNamespace = ( parser, moduleName, expr ) => {
	return moduleName &&
		parser.evaluate( moduleName ).identifier === 'imported var' &&
		expr.callee.type === 'MemberExpression' &&
		expr.callee.object.type === 'Identifier' &&
		expr.callee.object.name === moduleName &&
		expr.callee.property.type === 'Identifier' &&
		expr.callee.property.name === 'isEnabled' &&
		expr.arguments.length === 1 &&
		expr.arguments[ 0 ].type === 'Literal'
		? expr.arguments[ 0 ].value
		: null;
};

// Check that the given call expression is `isEnabled( 'flag' )`
// and return the `flag` literal value.
const isNamedCall = ( parser, methodName, expr ) => {
	return methodName &&
		parser.evaluate( methodName ).identifier === 'imported var' &&
		expr.callee.type === 'Identifier' &&
		expr.callee.name === methodName &&
		expr.arguments.length === 1 &&
		expr.arguments[ 0 ].type === 'Literal'
		? expr.arguments[ 0 ].value
		: null;
};

const moduleTypes = [ 'javascript/auto', 'javascript/dynamic', 'javascript/esm' ];

class ConfigFlagPlugin {
	constructor( options ) {
		this.flags = options && options.flags;
	}

	apply( compiler ) {
		const handleParser = parser => {
			// Hook into file changes.
			parser.hooks.program.tap( 'ConfigFlagPlugin', () => {
				// Reset imports on new file.
				this.moduleName = undefined;
				this.methodName = undefined;
			} );

			// Hook into imports.
			parser.hooks.import.tap( 'ConfigFlagPlugin', ( statement, source ) => {
				if ( source === 'config' ) {
					// We have an import of 'config'.
					const specifiers = statement.specifiers || [];

					for ( const sp of specifiers ) {
						// Default import (`import config from 'config'`)
						if ( sp.type === 'ImportDefaultSpecifier' ) {
							this.moduleName = sp.local && sp.local.name;
						}

						// Namespaced import (`import * as foo from 'config'`)
						if ( sp.type === 'ImportNamespaceSpecifier' ) {
							this.moduleName = sp.local && sp.local.name;
						}

						// Named import (`import { foo } from 'config'`)
						if ( sp.type === 'ImportSpecifier' && sp.imported.name === 'isEnabled' ) {
							this.methodName = sp.local && sp.local.name;
						}
					}
				}
			} );

			// Hook into every call expression.
			parser.hooks.evaluate.for( 'CallExpression' ).tap( 'ConfigFlagPlugin', expr => {
				// Check to see if this is a call to `config.isEnabled('flag')` or `isEnabled('flag')`, and
				// that these are what we expect them to be (the right module and the right method).
				const flag =
					isCallOnDefaultOrNamespace( parser, this.moduleName, expr ) ||
					isNamedCall( parser, this.methodName, expr );

				if ( flag && flag in this.flags ) {
					return new BasicEvaluatedExpression()
						.setBoolean( this.flags[ flag ] )
						.setRange( expr.range );
				}
			} );
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
