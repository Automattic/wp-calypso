/* eslint-disable no-console */

/**
 * @see https://webpack.js.org/api/module-variables/#__webpack_hash__-webpack-specific
 */
declare const __webpack_hash__: string;

export enum BuildState {
	INITIAL, // not yet connected
	IDLE,
	BUILDING,
	UPDATING,
	NEEDS_RELOAD,
	DISCONNECTED,
	ERROR,
}

type BuildStateSetter = ( buildState: BuildState ) => void;

interface UpdateMessage {
	errors: string[];
	warnings: string[];
	hash: string;
}

type ViteHotContext = {
	on: ( event: string, callback: ( payload?: unknown ) => void ) => void;
	off: ( event: string, callback: ( payload?: unknown ) => void ) => void;
};

type ViteImportMeta = ImportMeta & {
	hot?: ViteHotContext;
};

const VITE_HEALTH_CHECK_PATH = '/@vite/client';
const VITE_HEALTH_CHECK_INTERVAL = 5000;

// avoid reporting the same errors/warnings over and over
const previousProblems = new Map< string, string >();
function alreadyReported( type: string, problems: string[] ) {
	const key = problems.join( '\n' );
	if ( previousProblems.get( type ) === key ) {
		return true;
	}

	previousProblems.set( type, key );
	return false;
}

function reportProblems( type: string, problems: string[] ) {
	if ( alreadyReported( type, problems ) ) {
		return;
	}

	const log = type === 'errors' ? console.error : console.warn;
	log( `[webpack] build finished with ${ problems.length } ${ type }:` );
	for ( const problem of problems ) {
		log( problem );
	}
}

type HotModule = {
	hot?: {
		status: () => string;
		check: ( a: boolean ) => Promise< string[] >;
	};
};

function processUpdate( message: UpdateMessage, setBuildState: BuildStateSetter ) {
	const { errors, warnings, hash } = message;

	if ( errors.length ) {
		setBuildState( BuildState.ERROR );
		reportProblems( 'errors', errors );
		return;
	}

	if ( warnings.length ) {
		reportProblems( 'warnings', warnings );
	}

	if ( hash === __webpack_hash__ ) {
		setBuildState( BuildState.IDLE );
		return;
	}

	// if the webpack runtime doesn't have the hot reload plugin, reload is always needed
	const { hot } = module as HotModule;
	if ( ! hot ) {
		setBuildState( BuildState.NEEDS_RELOAD );
		return;
	}

	// hot update already in progress, triggered by another message handler
	if ( hot.status() !== 'idle' ) {
		return;
	}

	setBuildState( BuildState.UPDATING );

	hot
		.check( true )
		.then( ( updatedModules ) => {
			setBuildState( BuildState.IDLE );
			console.log( `[webpack] hot updated ${ updatedModules.length } modules:` );
			for ( const updatedModuleId of updatedModules ) {
				console.log( updatedModuleId );
			}
		} )
		.catch( ( error ) => {
			setBuildState( BuildState.NEEDS_RELOAD );
			console.error( '[webpack] hot update failed:', error );
		} );
}

function getViteHotContext(): ViteHotContext | undefined {
	return ( import.meta as ViteImportMeta ).hot;
}

function connectToViteServer( setBuildState: BuildStateSetter ) {
	const hot = getViteHotContext();
	if ( ! hot ) {
		return;
	}

	let isDisconnected = false;
	let isCheckingServer = false;

	const setIdle = () => {
		isDisconnected = false;
		setBuildState( BuildState.IDLE );
	};
	const setUpdating = () => setBuildState( BuildState.UPDATING );
	const setNeedsReload = () => setBuildState( BuildState.NEEDS_RELOAD );
	const setDisconnected = () => {
		isDisconnected = true;
		setBuildState( BuildState.DISCONNECTED );
	};
	const setError = ( payload?: unknown ) => {
		setBuildState( BuildState.ERROR );
		console.error( '[vite] build failed:', payload );
	};
	const checkServerConnection = async () => {
		if ( isCheckingServer ) {
			return;
		}

		isCheckingServer = true;

		try {
			const response = await fetch( VITE_HEALTH_CHECK_PATH, {
				method: 'HEAD',
				cache: 'no-store',
			} );

			if ( ! response.ok ) {
				throw new Error( `Vite health check failed with status ${ response.status }` );
			}

			if ( isDisconnected ) {
				setIdle();
			}
		} catch {
			setDisconnected();
		} finally {
			isCheckingServer = false;
		}
	};

	// The Vite websocket can connect before this lazily-loaded monitor mounts.
	setIdle();

	hot.on( 'vite:ws:connect', setIdle );
	hot.on( 'vite:ws:disconnect', setDisconnected );
	hot.on( 'vite:beforeUpdate', setUpdating );
	hot.on( 'vite:afterUpdate', setIdle );
	hot.on( 'vite:beforeFullReload', setNeedsReload );
	hot.on( 'vite:error', setError );

	const healthCheckIntervalId = window.setInterval(
		checkServerConnection,
		VITE_HEALTH_CHECK_INTERVAL
	);
	window.addEventListener( 'focus', checkServerConnection );
	document.addEventListener( 'visibilitychange', checkServerConnection );

	return () => {
		hot.off( 'vite:ws:connect', setIdle );
		hot.off( 'vite:ws:disconnect', setDisconnected );
		hot.off( 'vite:beforeUpdate', setUpdating );
		hot.off( 'vite:afterUpdate', setIdle );
		hot.off( 'vite:beforeFullReload', setNeedsReload );
		hot.off( 'vite:error', setError );
		window.clearInterval( healthCheckIntervalId );
		window.removeEventListener( 'focus', checkServerConnection );
		document.removeEventListener( 'visibilitychange', checkServerConnection );
	};
}

function connectToWebpackServer( setBuildState: BuildStateSetter ) {
	if ( typeof EventSource === 'undefined' ) {
		if ( process.env.NODE_ENV !== 'production' ) {
			console.warn( '[webpack] build monitor disabled. No `EventSource`.' );
		}
		return;
	}

	const source = new EventSource( '/__webpack_hmr' );

	source.onopen = () => {
		console.log( '[webpack] build monitor connected to server' );
		setBuildState( BuildState.IDLE );
	};

	source.onerror = ( error ) => {
		console.log( '[webpack] build monitor disconnected from server:', error );
		setBuildState( BuildState.DISCONNECTED );
	};

	source.onmessage = ( m ) => {
		if ( m.data === '💓' ) {
			return;
		}

		const message = JSON.parse( m.data );

		switch ( message.action ) {
			case 'building':
				setBuildState( BuildState.BUILDING );
				break;

			case 'built':
			case 'sync':
				processUpdate( message, setBuildState );
				break;
		}
	};

	return () => {
		source.close();
	};
}

export default function connectToBuildServer( setBuildState: BuildStateSetter ) {
	return connectToViteServer( setBuildState ) ?? connectToWebpackServer( setBuildState );
}
