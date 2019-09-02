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

const debug = debugFactory( 'calypso:webpack-build-monitor' );

enum BuildState {
	INITIAL, // not yet connected
	IDLE,
	BUILDING,
	BUILT_WITH_WARNINGS,
	ERROR,
}

interface HotServerConnectParams {
	setIsConnected: ( isConnected: boolean ) => void;
	setBuildState: ( buildState: BuildState ) => void;
	setLastHash: ( lastHash: string ) => void;
}

function connectToHotServer( {
	setIsConnected,
	setBuildState,
	setLastHash,
}: HotServerConnectParams ) {
	if ( typeof EventSource === 'undefined' ) {
		if ( process.env.NODE_ENV !== 'production' ) {
			// eslint-disable-next-line no-console
			console.warn( 'Webpack build monitor disabled. No `EventSource`.' );
		}
		return;
	}

	debug( 'Webpack HMR connecting' );
	const source = new EventSource( '/__webpack_hmr' );

	source.onopen = () => {
		debug( 'Webpack HMR connected' );
		setIsConnected( true );
	};

	source.onmessage = ( m: MessageEvent ) => {
		if ( m.data === '💓' ) {
			return;
		}

		let action: string | undefined;
		let nextErrors;
		let nextWarnings;

		try {
			const parsedData = JSON.parse( m.data );
			debug( 'Webpack HMR message: %o', parsedData );
			action = parsedData.action;
			nextErrors = parsedData.errors;
			nextWarnings = parsedData.warnings;
			if ( parsedData.hash ) {
				setLastHash( parsedData.hash );
			}
		} catch ( err ) {
			debug( 'Could not parse HMR message.data %o', m.data );
		}

		switch ( action ) {
			case 'building':
				setBuildState( BuildState.BUILDING );
				break;

			case 'built':
				if ( nextErrors.length ) {
					setBuildState( BuildState.ERROR );
				} else if ( nextWarnings.length ) {
					setBuildState( BuildState.BUILT_WITH_WARNINGS );
				} else {
					setBuildState( BuildState.IDLE );
				}
				break;

			case 'sync':
				if ( nextErrors.length ) {
					setBuildState( BuildState.ERROR );
				}
				break;
		}
	};

	return () => {
		source.close();
	};
}

const WebpackBuildMonitor: FunctionComponent = () => {
	const [ lastHash, setLastHash ] = useState( __webpack_hash__ );
	const [ isConnected, setIsConnected ] = useState( false );
	const [ buildState, setBuildState ] = useState( BuildState.INITIAL );

	useEffect( () => connectToHotServer( { setIsConnected, setBuildState, setLastHash } ), [] );

	const needsReload = lastHash !== __webpack_hash__;

	let msg: string | null = null;
	if ( buildState === BuildState.INITIAL ) {
		msg = null; // don't show anything until connected for the first time
	} else if ( ! isConnected ) {
		msg = 'Webpack disconnected';
	} else if ( buildState === BuildState.BUILDING ) {
		msg = 'Webpack building…';
	} else if ( needsReload ) {
		msg = 'Need to refresh';
	} else if ( buildState === BuildState.ERROR ) {
		msg = 'Webpack error';
	}

	if ( ! msg ) {
		return null;
	}

	return (
		<div
			className={ classNames( 'webpack-build-monitor', {
				'is-error': buildState === BuildState.ERROR || ! isConnected,
				'is-warning': buildState === BuildState.BUILT_WITH_WARNINGS || needsReload,
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
