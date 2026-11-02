const path = require( 'path' );

/**
 * Plugin name.
 * @type {string}
 */
const PLUGIN_NAME = 'OrderDependentRedirect';

const NODE_MODULES = /^.*[\\/]node_modules[\\/]/;

const isDependency = ( file ) => NODE_MODULES.test( file );

const display = ( file ) =>
	isDependency( file ) ? file.replace( NODE_MODULES, '' ) : path.relative( process.cwd(), file );

/**
 * Explains the error in terms of the reader's own code.
 * @param {Object} item the reported read
 * @returns {string} the error message
 */
const describe = ( item ) => {
	const { module, dependency, ids, root, barrel } = item;
	const file = display( module.resource );
	const local = dependency.name || ids[ 0 ];
	const read = [ local, ...ids.slice( 1 ) ].join( '.' );
	const member = ids[ 1 ];
	const fix = isDependency( module.resource )
		? [
				`${ file } is inside a dependency, so it can't be changed here. Instead, add this rule to`,
				'`module.rules` in the webpack config, so webpack always keeps that file in place:',
				'',
				`    { test: /${ display( barrel.resource ).replace( /[./]/g, '\\$&' ) }$/, sideEffects: true }`,
			]
		: [
				`To fix it, copy \`${ member }\` into a variable where you use it, and use that variable in`,
				`place of \`${ local }.${ member }\`:`,
				'',
				`    const { ${ member } } = ${ local };`,
			];
	return [
		'This import makes the build output change from one build to the next, even when nothing changed.',
		'',
		`    ${ file } reads \`${ read }\` from '${ dependency.request }'.`,
		'',
		'Webpack works out which file that read points to while it builds, and its answer can differ',
		`between builds, because ${ display( barrel.resource ) } and`,
		`${ display( root.resource ) } import each other, directly or through other files.`,
		'Each time the answer changes, files that did not change get new names, so visitors download',
		'them again.',
		'',
		...fix,
		'',
		'(Reported by build-tools/webpack/order-dependent-redirect-plugin.js.)',
	].join( '\n' );
};

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
					const { moduleGraph } = compilation;
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
							if (
								! namespace ||
								( namespace.export && namespace.export.length ) ||
								! isSideEffectFree( namespace.module )
							) {
								continue;
							}
							// …whose `member` webpack could skip past as well.
							if ( getTarget( namespace.module, ids[ 1 ] ) ) {
								candidates.push( { module, dependency, ids, root, barrel: namespace.module } );
							}
						}
					}
					if ( ! candidates.length ) {
						return;
					}

					const component = getComponents( modules, moduleGraph );
					for ( const item of candidates ) {
						if ( component.get( item.root ) !== component.get( item.barrel ) ) {
							continue;
						}
						const error = new compiler.webpack.WebpackError( describe( item ) );
						error.module = item.module;
						compilation.errors.push( error );
					}
				}
			);
		} );
	}
}

module.exports = OrderDependentRedirectPlugin;
