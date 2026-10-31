/**
 * Plugin name.
 * @type {string}
 */
const PLUGIN_NAME = 'OrderDependentRedirect';

/**
 * Fails the build when webpack's side-effects optimization left an import on a side-effect-free
 * module it could still skip past. That only happens when the import was redirected onto the
 * module after the module itself was processed, so the output depends on build order: e.g.
 * `ns.member` read through a barrel that sits in an import cycle.
 */
class OrderDependentRedirectPlugin {
	apply( compiler ) {
		compiler.hooks.thisCompilation.tap( PLUGIN_NAME, ( compilation ) => {
			// Read here: plugins are applied before webpack fills in option defaults. Without the
			// optimization (development), no import is redirected and every one would be reported.
			if ( compilation.options.optimization.sideEffects !== true ) {
				return;
			}

			// After SideEffectsFlagPlugin, which runs at the default stage.
			compilation.hooks.optimizeDependencies.tap(
				{ name: PLUGIN_NAME, stage: 100 },
				( modules ) => {
					const { moduleGraph, requestShortener } = compilation;
					const isSideEffectFree = ( module ) =>
						module.getSideEffectsConnectionState( moduleGraph ) === false;

					for ( const module of modules ) {
						if ( ! isSideEffectFree( module ) ) {
							continue;
						}
						const exportsInfo = moduleGraph.getExportsInfo( module );
						for ( const connection of moduleGraph.getIncomingConnections( module ) ) {
							const { dependency, originModule } = connection;
							if (
								! originModule ||
								! dependency ||
								dependency.type !== 'harmony import specifier' ||
								dependency.namespaceObjectAsContext ||
								// A redirect clones the connection onto the new target and leaves this one behind.
								moduleGraph.getConnection( dependency ) !== connection
							) {
								continue;
							}
							const ids = dependency.getIds( moduleGraph );
							if ( ids.length === 0 ) {
								continue;
							}
							const target = exportsInfo
								.getExportInfo( ids[ 0 ] )
								.getTarget( moduleGraph, ( { module: candidate } ) =>
									isSideEffectFree( candidate )
								);
							if ( ! target ) {
								continue;
							}

							const barrel = module.readableIdentifier( requestShortener );
							const fix = /[\\/]node_modules[\\/]/.test( originModule.resource || '' )
								? 'The importing file is a dependency, so instead mark the barrel as having side ' +
									'effects, which stops webpack skipping it: add a module rule ' +
									`\`{ test: <path of ${ barrel }>, sideEffects: true }\`.`
								: 'Destructure the namespace once (`const { member } = namespace;`) and use the ' +
									'local binding instead.';
							const error = new compiler.webpack.WebpackError(
								`${ PLUGIN_NAME }: ${ originModule.readableIdentifier( requestShortener ) } reads ` +
									`\`${ ids.join( '.' ) }\` through ${ barrel }, which webpack skips in some ` +
									`builds and not others, so chunk hashes change between identical builds. ${ fix }`
							);
							error.module = originModule;
							compilation.errors.push( error );
						}
					}
				}
			);
		} );
	}
}

module.exports = OrderDependentRedirectPlugin;
