/**
 * Plugin name.
 * @type {string}
 */
const PLUGIN_NAME = 'OrderDependentRedirect';

/**
 * Returns the strongly connected components of the module graph, as a map from each module to a
 * representative of its component (iterative Tarjan).
 * @param {Iterable<import('webpack').Module>} modules all modules of the compilation
 * @param {import('webpack').ModuleGraph} moduleGraph the module graph
 * @returns {Map<import('webpack').Module, import('webpack').Module>} module to component
 */
const getComponents = ( modules, moduleGraph ) => {
	const component = new Map();
	const index = new Map();
	const low = new Map();
	const stack = [];
	const onStack = new Set();
	let next = 0;
	const visit = ( module ) => {
		index.set( module, next );
		low.set( module, next++ );
		stack.push( module );
		onStack.add( module );
		const targets = [];
		for ( const connection of moduleGraph.getOutgoingConnections( module ) ) {
			if ( connection.module && connection.module !== module ) {
				targets.push( connection.module );
			}
		}
		return [ module, targets, 0 ];
	};
	for ( const start of modules ) {
		if ( index.has( start ) ) {
			continue;
		}
		const work = [ visit( start ) ];
		while ( work.length ) {
			const frame = work[ work.length - 1 ];
			const [ module, targets ] = frame;
			if ( frame[ 2 ] < targets.length ) {
				const target = targets[ frame[ 2 ]++ ];
				if ( ! index.has( target ) ) {
					work.push( visit( target ) );
				} else if ( onStack.has( target ) ) {
					low.set( module, Math.min( low.get( module ), index.get( target ) ) );
				}
				continue;
			}
			work.pop();
			if ( work.length ) {
				const parent = work[ work.length - 1 ][ 0 ];
				low.set( parent, Math.min( low.get( parent ), low.get( module ) ) );
			}
			if ( low.get( module ) === index.get( module ) ) {
				let member;
				do {
					member = stack.pop();
					onStack.delete( member );
					component.set( member, module );
				} while ( member !== module );
			}
		}
	}
	return component;
};

/**
 * Fails the build on imports whose target depends on build order. Webpack's side-effects
 * optimization moves `namespace.member` reads past side-effect-free barrels, and when the
 * namespace barrel sits in an import cycle with the module it is read from, whether the read
 * stops at the barrel or skips it depends on which module finished building first. Checked
 * before that optimization runs, from the module graph alone, so the result doesn't depend on
 * build order either.
 */
class OrderDependentRedirectPlugin {
	apply( compiler ) {
		compiler.hooks.thisCompilation.tap( PLUGIN_NAME, ( compilation ) => {
			// Read here: plugins are applied before webpack fills in option defaults. Without the
			// optimization (development), no import is moved, so there is no race.
			if ( compilation.options.optimization.sideEffects !== true ) {
				return;
			}

			// Before SideEffectsFlagPlugin, which runs at the default stage.
			compilation.hooks.optimizeDependencies.tap(
				{ name: PLUGIN_NAME, stage: -100 },
				( modules ) => {
					const { moduleGraph, requestShortener } = compilation;
					const isSideEffectFree = ( module ) =>
						module.getSideEffectsConnectionState( moduleGraph ) === false;
					const getTarget = ( module, name ) =>
						moduleGraph
							.getExportsInfo( module )
							.getExportInfo( name )
							.getTarget( moduleGraph, ( { module: candidate } ) => isSideEffectFree( candidate ) );

					const candidates = [];
					for ( const module of modules ) {
						for ( const dependency of module.dependencies ) {
							if (
								// Also matches its `evaluated X … harmony import specifier` subclass, as webpack does.
								! dependency.type.endsWith( 'harmony import specifier' ) ||
								dependency.namespaceObjectAsContext
							) {
								continue;
							}
							const ids = dependency.getIds( moduleGraph );
							const root = ids.length > 1 && moduleGraph.getModule( dependency );
							if ( ! root || ! isSideEffectFree( root ) ) {
								continue;
							}
							// `namespace.member`, where `namespace` re-exports a whole side-effect-free module…
							const namespace = getTarget( root, ids[ 0 ] );
							if ( ! namespace || ( namespace.export && namespace.export.length ) ) {
								continue;
							}
							// …whose `member` webpack could skip past as well.
							if ( getTarget( namespace.module, ids[ 1 ] ) ) {
								candidates.push( { module, ids, root, barrel: namespace.module } );
							}
						}
					}
					if ( ! candidates.length ) {
						return;
					}

					const component = getComponents( modules, moduleGraph );
					for ( const { module, ids, root, barrel } of candidates ) {
						if ( component.get( root ) !== component.get( barrel ) ) {
							continue;
						}
						const barrelName = barrel.readableIdentifier( requestShortener );
						const fix = /[\\/]node_modules[\\/]/.test( module.resource || '' )
							? 'The importing file is a dependency, so instead mark the barrel as having side ' +
								'effects, which stops webpack skipping it: add a module rule ' +
								`\`{ test: <path of ${ barrelName }>, sideEffects: true }\`.`
							: 'Destructure the member where it is used (`const { member } = namespace;`) and ' +
								'call the local binding instead.';
						const error = new compiler.webpack.WebpackError(
							`${ PLUGIN_NAME }: ${ module.readableIdentifier( requestShortener ) } reads ` +
								`\`${ ids.join( '.' ) }\` through ${ barrelName }, which is in an import cycle ` +
								'with the module it is read from. Webpack skips the barrel in some builds and not ' +
								`others, so chunk hashes change between identical builds. ${ fix }`
						);
						error.module = module;
						compilation.errors.push( error );
					}
				}
			);
		} );
	}
}

module.exports = OrderDependentRedirectPlugin;
