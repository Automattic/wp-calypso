// Based on: webpack-hot-middleware v2.25.3, but modified to use websockets instead of EventSource
const parse = require( 'url' ).parse;
const WebSocket = require( 'ws' );

function pathMatch( url, path ) {
	try {
		return parse( url ).pathname === path;
	} catch ( e ) {
		return false;
	}
}

function webpackHotMiddleware( compiler, opts ) {
	opts = opts || {};
	opts.log = typeof opts.log === 'undefined' ? console.log.bind( console ) : opts.log;
	opts.path = opts.path || '/__webpack_hmr';
	opts.heartbeat = opts.heartbeat || 10 * 1000;

	const webSocketServer = createWebSocketServer( opts.port );
	let latestStats = null;
	let closed = false;

	if ( compiler.hooks ) {
		compiler.hooks.invalid.tap( 'webpack-hot-middleware', onInvalid );
		compiler.hooks.done.tap( 'webpack-hot-middleware', onDone );
	} else {
		compiler.plugin( 'invalid', onInvalid );
		compiler.plugin( 'done', onDone );
	}

	function onInvalid() {
		if ( closed ) {
			return;
		}
		latestStats = null;
		if ( opts.log ) {
			opts.log( 'webpack building...' );
		}
		webSocketServer.publish( { action: 'building' } );
	}

	function onDone( statsResult ) {
		if ( closed ) {
			return;
		}
		latestStats = statsResult;
		publishStats( 'built', latestStats, webSocketServer, opts.log );
	}

	const middleware = function ( req, res, next ) {
		if ( closed ) {
			return next();
		}
		// TODO: This whole path thing might not be neeeded any more. Investigate.
		if ( ! pathMatch( req.url, opts.path ) ) {
			return next();
		}
		if ( latestStats ) {
			publishStats( 'sync', latestStats, webSocketServer );
		}
	};

	middleware.publish = function ( payload ) {
		if ( closed ) {
			return;
		}
		webSocketServer.publish( payload );
	};

	middleware.close = function () {
		if ( closed ) {
			return;
		}
		closed = true;
		webSocketServer.close();
	};

	return middleware;
}

function createWebSocketServer( port = 8355 ) {
	const clients = new Set();
	const wss = new WebSocket.Server( { port } );

	wss.on( 'connection', ( ws /*, req */ ) => {
		clients.add( ws );

		ws.on( 'message', ( message ) => {
			console.log( `Received: ${ message }` );
		} );

		ws.on( 'close', () => {
			clients.delete( ws );
		} );
	} );

	return {
		wss,
		close: function () {
			wss.close();
			for ( const client of clients ) {
				client.close();
			}
			clients.clear();
		},
		publish: function ( payload ) {
			const data = JSON.stringify( payload );
			clients.forEach( ( client ) => {
				if ( client.readyState === WebSocket.OPEN ) {
					client.send( data );
				}
			} );
		},
	};
}

function publishStats( action, statsResult, eventStream, log ) {
	const statsOptions = {
		all: false,
		cached: true,
		children: true,
		modules: true,
		timings: true,
		hash: true,
		errors: true,
		warnings: true,
	};

	let bundles = [];

	// multi-compiler stats have stats for each child compiler
	// see https://github.com/webpack/webpack/blob/main/lib/MultiCompiler.js#L97
	if ( statsResult.stats ) {
		const processed = statsResult.stats.map( function ( stats ) {
			return extractBundles( normalizeStats( stats, statsOptions ) );
		} );

		bundles = processed.flat();
	} else {
		bundles = extractBundles( normalizeStats( statsResult, statsOptions ) );
	}

	bundles.forEach( function ( stats ) {
		let name = stats.name || '';

		// Fallback to compilation name in case of 1 bundle (if it exists)
		if ( ! name && stats.compilation ) {
			name = stats.compilation.name || '';
		}

		if ( log ) {
			log(
				'webpack built ' + ( name ? name + ' ' : '' ) + stats.hash + ' in ' + stats.time + 'ms'
			);
		}

		eventStream.publish( {
			name: name,
			action: action,
			time: stats.time,
			hash: stats.hash,
			warnings: formatErrors( stats.warnings || [] ),
			errors: formatErrors( stats.errors || [] ),
			modules: buildModuleMap( stats.modules ),
		} );
	} );
}

function formatErrors( errors ) {
	if ( ! errors || ! errors.length ) {
		return [];
	}

	if ( typeof errors[ 0 ] === 'string' ) {
		return errors;
	}

	// Convert webpack@5 error info into a backwards-compatible flat string
	return errors.map( function ( error ) {
		return error.moduleName + ' ' + error.loc + '\n' + error.message;
	} );
}

function normalizeStats( stats, statsOptions ) {
	const statsJson = stats.toJson( statsOptions );

	if ( stats.compilation ) {
		// webpack 5 has the compilation property directly on stats object
		Object.assign( statsJson, {
			compilation: stats.compilation,
		} );
	}

	return statsJson;
}

function extractBundles( stats ) {
	// Stats has modules, single bundle
	if ( stats.modules ) {
		return [ stats ];
	}

	// Stats has children, multiple bundles
	if ( stats.children && stats.children.length ) {
		return stats.children;
	}

	// Not sure, assume single
	return [ stats ];
}

function buildModuleMap( modules ) {
	const map = {};
	modules.forEach( function ( module ) {
		map[ module.id ] = module.name;
	} );
	return map;
}
module.exports = webpackHotMiddleware;
