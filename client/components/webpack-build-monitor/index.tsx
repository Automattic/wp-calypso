/* eslint-disable no-console */

/**
 * @see https://webpack.js.org/api/module-variables/#__webpack_hash__-webpack-specific
 */
declare const __webpack_hash__: string;

/**
 * External dependencies
 */
import React, { FunctionComponent, useEffect, useState } from 'react';
import classNames from 'classnames';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Spinner from 'components/spinner';

/**
 * Style dependencies
 */
import './style.scss';

enum BuildState {
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

const debug = debugFactory( 'calypso:webpack-build-monitor' );

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
	if ( ! module.hot ) {
		setBuildState( BuildState.NEEDS_RELOAD );
		return;
	}

	// hot update already in progress, triggered by another message handler
	if ( module.hot.status() !== 'idle' ) {
		return;
	}

	setBuildState( BuildState.UPDATING );

	module.hot
		.check( true )
		.then( updatedModules => {
			setBuildState( BuildState.IDLE );
			console.log( `[webpack] hot updated ${ updatedModules.length } modules:` );
			for ( const updatedModuleId of updatedModules ) {
				console.log( updatedModuleId );
			}
		} )
		.catch( error => {
			setBuildState( BuildState.NEEDS_RELOAD );
			console.error( '[webpack] hot update failed:', error );
		} );
}

function connectToHotServer( setBuildState: BuildStateSetter ) {
	if ( typeof EventSource === 'undefined' ) {
		if ( process.env.NODE_ENV !== 'production' ) {
			console.warn( '[webpack] build monitor disabled. No `EventSource`.' );
		}
		return;
	}

	debug( 'Webpack HMR connecting' );
	const source = new EventSource( '/__webpack_hmr' );

	source.onopen = () => {
		debug( 'Webpack HMR connected' );
		setBuildState( BuildState.IDLE );
	};

	source.onerror = error => {
		debug( 'Webpack HMR disconnected:', error );
		setBuildState( BuildState.DISCONNECTED );
	};

	source.onmessage = ( m: MessageEvent ) => {
		if ( m.data === '💓' ) {
			return;
		}

		const message = JSON.parse( m.data );
		debug( 'Webpack HMR message: %o', message );

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

const WebpackBuildMonitor: FunctionComponent = () => {
	const [ buildState, setBuildState ] = useState( BuildState.INITIAL );

	useEffect( () => connectToHotServer( setBuildState ), [] );

	let msg: string | null = null;
	if ( buildState === BuildState.INITIAL ) {
		msg = null; // don't show anything until connected for the first time
	} else if ( buildState === BuildState.DISCONNECTED ) {
		msg = 'Disconnected';
	} else if ( buildState === BuildState.BUILDING ) {
		msg = 'Building…';
	} else if ( buildState === BuildState.UPDATING ) {
		msg = 'Hot updating…';
	} else if ( buildState === BuildState.NEEDS_RELOAD ) {
		msg = 'Need to refresh';
	} else if ( buildState === BuildState.ERROR ) {
		msg = 'Build failed';
	}

	if ( ! msg ) {
		return null;
	}

	return (
		<div
			className={ classNames( 'webpack-build-monitor', {
				'is-error': buildState === BuildState.ERROR || buildState === BuildState.DISCONNECTED,
				'is-warning': buildState === BuildState.NEEDS_RELOAD,
			} ) }
		>
			{ buildState === BuildState.BUILDING && (
				<Spinner size={ 11 } className="webpack-build-monitor__spinner" />
			) }
			{ msg }
		</div>
	);
};

export default WebpackBuildMonitor;
