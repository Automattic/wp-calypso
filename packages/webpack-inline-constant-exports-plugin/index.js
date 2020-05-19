const HarmonyImportSideEffectDependency = require( 'webpack/lib/dependencies/HarmonyImportSideEffectDependency' );
const HarmonyImportSpecifierDependency = require( 'webpack/lib/dependencies/HarmonyImportSpecifierDependency' );
const ConstDependency = require( 'webpack/lib/dependencies/ConstDependency' );

function addConstantExport( module, name, value ) {
	if ( ! module.constantExports ) {
		module.constantExports = {};
	}
	module.constantExports[ name ] = value;
}

function removeDependency( module, dep ) {
	module.removeDependency( dep );
	dep.module.reasons = dep.module.reasons.filter( ( r ) => r.dependency !== dep );
}

class InlineConstantExportsPlugin {
	/*
	 * `matchers` is a regular expression or an array of regular expressions that are used
	 * to match module paths. Only constants from matching modules will be inlined.
	 */
	constructor( matchers ) {
		if ( Array.isArray( matchers ) ) {
			this.matchers = matchers;
		} else {
			this.matchers = [ matchers ];
		}
	}

	isConstantsModule( module ) {
		return module && this.matchers.some( ( matcher ) => matcher.test( module.resource ) );
	}

	apply( compiler ) {
		compiler.hooks.compilation.tap(
			'InlineConstantExportsPlugin',
			( compilation, { normalModuleFactory } ) => {
				/*
				 * Look at parsed module source code and look for constant exports. If found, put them into
				 * the `constantExports` map field on the `module` object.
				 */
				const handleParser = ( parser ) => {
					const handleExport = ( statement, declaration ) => {
						const { module } = parser.state;

						if ( ! this.isConstantsModule( module ) ) {
							return;
						}

						/* Look for statements like `export const FOO = 'foo';`
						 * The `Literal` AST type includes strings, numbers, booleans and null. It doesn't include
						 * array and object literals, which have the `ArrayExpression` and `ObjectExpression`
						 * types, respectively. We don't want to inline arrays and objects, because they wouldn't
						 * be `===`-equal to each other then.
						 *
						 * The constant variable needs to be declared using the `const` keyword. Inlining
						 * `export let FOO = 'foo'` is not safe, because the `FOO` variable can be modified later
						 * and ESM exports are live bindings.
						 */
						if (
							statement.type === 'ExportNamedDeclaration' &&
							declaration.type === 'VariableDeclaration' &&
							declaration.kind === 'const'
						) {
							for ( const declarator of declaration.declarations ) {
								if ( declarator.init.type === 'Literal' ) {
									addConstantExport( module, declarator.id.name, declarator.init.raw );
								}
							}
						}

						/* Look for statements like `export default 123;` */
						if ( statement.type === 'ExportDefaultDeclaration' && declaration.type === 'Literal' ) {
							addConstantExport( module, 'default', declaration.raw );
						}

						/*
						 * TODO: we don't detect constant exports like
						 *   const FOO = 'foo';
						 *   export { FOO }
						 * or
						 *   const BAR = 'bar';
						 *   export default BAR;
						 * Supporting this syntax would require more complex analysis. There is prior art in
						 * webpack's module concanenation plugin that uses `eslint-scope` to do this kind of
						 * analysis, so it's certainly possible.
						 */
					};

					/* ExportNamedDeclaration nodes trigger this hook */
					parser.hooks.exportDeclaration.tap( 'InlineConstantExportsPlugin', handleExport );
					/* ExportDefaultDeclaration nodes trigger this hook */
					parser.hooks.exportExpression.tap( 'InlineConstantExportsPlugin', handleExport );
				};

				/* Hook into all JavaScript module types */
				for ( const moduleType of [ 'javascript/auto', 'javascript/dynamic', 'javascript/esm' ] ) {
					normalModuleFactory.hooks.parser
						.for( moduleType )
						.tap( 'InlineConstantExportsPlugin', handleParser );
				}

				/*
				 * Use the information gathered during the parse phase to optimize the constant dependencies
				 * by inlining them.
				 */
				compilation.hooks.optimizeDependencies.tap( 'InlineConstantExportsPlugin', ( modules ) => {
					for ( const module of modules ) {
						/* Track the dependencies we find in this module, so that we can correctly remove them
						 * at the end. */
						const importSideEffectDependencies = new Map(); // Module -> Dependency
						const usesNonConstantDependencies = new Map(); // Module -> Boolean
						const usesConstantDependencies = new Map(); // Module -> Boolean
						const importSpecifierDependencies = []; // [ ImportSpecifierDependency ]

						for ( const dep of module.dependencies ) {
							if ( ! this.isConstantsModule( dep.module ) ) {
								continue;
							}

							/*
							 * The ImportSideEffectDependency is created whenever webpack sees an import statement:
							 *   import { foo } from 'foo'
							 * Webpack replaces the statement with code that loads the module and executes it
							 *
							 * We track these dependencies per-module because if all the imported bindings
							 * turn out to be constants and we inline them, we'll remove the import completely.
							 * That means that we treat constant modules as side-effect fee, i.e., we can safely
							 * remove the import.
							 */
							if ( dep instanceof HarmonyImportSideEffectDependency ) {
								importSideEffectDependencies.set( dep.module, dep );
							}

							/*
							 * The ImportSpecifierDependency is created whenever an imported binding is used
							 * in code. For example, the following code:
							 *   import { BLOGGER } from 'plans';
							 *   console.log( BLOGGER );
							 *
							 * is tranformed into something like:
							 *   webpack__module__plans = webpack__require( 'plans' );
							 *   console.log( webpack__module__plans.get( 'BLOGGER' ) );
							 *
							 * The first line is the side effect dependency, the second line contains a specifier
							 * dependency. Both lines are transformed by webpack, and that's what webpack
							 * dependencies do: mark code that needs to be transformed and specify how.
							 *
							 * When inlining a constant, we remove the ImportSpecifierDependency and replace it
							 * with a ConstDependency that inserts the inlined code verbatim.
							 */
							if ( dep instanceof HarmonyImportSpecifierDependency ) {
								if ( dep.module.constantExports && dep.id in dep.module.constantExports ) {
									// Mark the dependency for removal: we'll remove it after we're finished
									// traversing the dependency graph.
									importSpecifierDependencies.push( dep );

									let inlinedCode;
									/*
									 * There is one special case when we use the imported variable in object shorthand:
									 *   import { BLOGGER } from 'plans';
									 *   const supportedPlans = { BLOGGER };
									 * Then we need to expand the shorthand into `{ BLOGGER: __inline_value__ }`
									 */
									if ( dep.shorthand ) {
										inlinedCode = `${ dep.name }: ${ dep.module.constantExports[ dep.id ] }`;
									} else {
										/* Every other usage is just inlined as is */
										inlinedCode = dep.module.constantExports[ dep.id ];
									}
									const inlineDep = new ConstDependency( '/* inline */ ' + inlinedCode, dep.range );
									inlineDep.loc = dep.loc;
									module.addDependency( inlineDep );

									/* Remember the fact that we inlined some constant. We remove import statements
									 * only for modules where we inlined at least something. The other modules we
									 * leave as they are. */
									usesConstantDependencies.set( dep.module, true );
								} else {
									/* This dependency was not a constant and cannot be inlined. Remember this fact
									 * so that we don't remove the import statement for this module. */
									usesNonConstantDependencies.set( dep.module, true );
								}
							}
						}

						/* Remove the import statements if all the imported bindings were inlined */
						for ( const [ depModule, depImport ] of importSideEffectDependencies ) {
							if (
								usesConstantDependencies.get( depModule ) &&
								! usesNonConstantDependencies.get( depModule )
							) {
								removeDependency( module, depImport );
							}
						}

						/* Remove the ImportSpecifierDependencies that were replaced with ConstDependencies */
						for ( const dep of importSpecifierDependencies ) {
							removeDependency( module, dep );
						}
					}
				} );
			}
		);
	}
}

module.exports = InlineConstantExportsPlugin;
