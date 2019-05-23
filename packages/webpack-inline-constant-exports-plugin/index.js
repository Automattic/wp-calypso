const HarmonyImportSideEffectDependency = require( 'webpack/lib/dependencies/HarmonyImportSideEffectDependency' );
const HarmonyImportSpecifierDependency = require( 'webpack/lib/dependencies/HarmonyImportSpecifierDependency' );
const ConstDependency = require( 'webpack/lib/dependencies/ConstDependency' );

const moduleTypes = [ 'javascript/auto', 'javascript/dynamic', 'javascript/esm' ];

function addConstantExport( module, name, value ) {
	if ( ! module.constantExports ) {
		module.constantExports = {};
	}
	module.constantExports[ name ] = value;
}

function removeDependency( module, dep ) {
	module.removeDependency( dep );
	dep.module.reasons = dep.module.reasons.filter( r => r.dependency !== dep );
}

class InlinePlugin {
	constructor( matchers ) {
		if ( Array.isArray( matchers ) ) {
			this.matchers = matchers;
		} else {
			this.matchers = [ matchers ];
		}
	}

	isConstantsModule( module ) {
		return module && this.matchers.some( matcher => matcher.test( module.resource ) );
	}

	apply( compiler ) {
		compiler.hooks.compilation.tap( 'InlinePlugin', ( compilation, { normalModuleFactory } ) => {
			const handleParser = parser => {
				const handleExport = ( statement, declaration ) => {
					const { module } = parser.state;

					if ( ! this.isConstantsModule( module ) ) {
						return;
					}

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

					if ( statement.type === 'ExportDefaultDeclaration' && declaration.type === 'Literal' ) {
						addConstantExport( module, 'default', declaration.raw );
					}
				};

				parser.hooks.exportDeclaration.tap( 'InlinePlugin', handleExport );
				parser.hooks.exportExpression.tap( 'InlinePlugin', handleExport );
			};

			moduleTypes.forEach( moduleType => {
				normalModuleFactory.hooks.parser.for( moduleType ).tap( 'InlinePlugin', handleParser );
			} );

			compilation.hooks.optimizeDependencies.tap( 'InlinePlugin', modules => {
				for ( const module of modules ) {
					const importStatementDependencies = new Map();
					const usesNonConstantDependencies = new Map();
					const importSpecifierDependencies = [];

					for ( const dep of module.dependencies ) {
						if ( ! this.isConstantsModule( dep.module ) ) {
							continue;
						}

						if ( dep instanceof HarmonyImportSideEffectDependency ) {
							importStatementDependencies.set( dep.module, dep );
						}

						if ( dep instanceof HarmonyImportSpecifierDependency ) {
							if ( dep.module.constantExports && dep.id in dep.module.constantExports ) {
								importSpecifierDependencies.push( dep );
								const inlineDep = new ConstDependency(
									[
										'/* <inline> */ ',
										dep.shorthand ? `${ dep.name }: ` : '',
										dep.module.constantExports[ dep.id ],
										' /* </inline> */',
									].join( '' ),
									dep.range
								);
								inlineDep.loc = dep.loc;
								module.addDependency( inlineDep );
							} else {
								usesNonConstantDependencies.set( dep.module, true );
							}
						}
					}

					for ( const [ depModule, depImport ] of importStatementDependencies ) {
						if ( ! usesNonConstantDependencies.get( depModule ) ) {
							removeDependency( module, depImport );
						}
					}

					for ( const dep of importSpecifierDependencies ) {
						removeDependency( module, dep );
					}
				}
			} );
		} );
	}
}

module.exports = InlinePlugin;
