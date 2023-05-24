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

export default function connectToWebpackServer( setBuildState: BuildStateSetter ) {
	const socket = new WebSocket( 'ws://localhost:8355' );

	socket.onopen = () => {
		console.log( '[webpack] build monitor connected to server' );
		setBuildState( BuildState.IDLE );
	};

	socket.onerror = ( error ) => {
		console.error( '[webpack] build monitor encountered an error:', error );
		setBuildState( BuildState.DISCONNECTED );
	};

	socket.onclose = () => {
		console.log( '[webpack] build monitor disconnected from server' );
		setBuildState( BuildState.DISCONNECTED );
	};

	socket.onmessage = ( m ) => {
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
		socket.close();
	};
}
