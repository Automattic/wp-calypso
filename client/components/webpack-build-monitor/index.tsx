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
import { IntervalHandle, TimestampMS } from 'client/types';

/**
 * Style dependencies
 */
import './style.scss';

const CONNECTION_TIMEOUT = 20 * 1000;
const debug = debugFactory( 'calypso:webpack-build-monitor' );

enum BuildState {
	UNKNOWN,
	IDLE,
	BUILDING,
	BUILT_WITH_WARNINGS,
	ERROR,
}

const WebpackBuildMonitor: FunctionComponent = () => {
	const [ lastHash, setLastHash ] = useState( __webpack_hash__ );
	const [ isConnected, setIsConnected ] = useState( false );
	const [ buildState, setBuildState ] = useState( BuildState.UNKNOWN );

	useEffect( () => {
		if ( typeof EventSource === 'undefined' ) {
			if ( process.env.NODE_ENV !== 'production' ) {
				// eslint-disable-next-line no-console
				console.warn( 'Webpack build monitor disabled. No `EventSource`.' );
			}
		} else {
			let lastActivity: TimestampMS;
			let connectionTimer: IntervalHandle;
			let source: EventSource;
			const connect = () => {
				debug( 'Webpack HMR connecting' );
				source = new EventSource( '/__webpack_hmr' );

				source.onopen = () => {
					debug( 'Webpack HMR connected' );
					setIsConnected( true );
					lastActivity = Date.now();
					connectionTimer = setInterval( () => {
						if ( Date.now() - lastActivity > CONNECTION_TIMEOUT ) {
							debug( 'Webpack HMR connection timeout. Reconnecting in %o…', CONNECTION_TIMEOUT );
							setIsConnected( false );
							clearInterval( connectionTimer );
							source.close();
							setTimeout( connect, CONNECTION_TIMEOUT );
						}
					}, CONNECTION_TIMEOUT / 2 );
				};

				source.onmessage = ( m: MessageEvent ) => {
					lastActivity = Date.now();
					if ( m.data !== '💓' ) {
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
					}
				};
			};

			connect();

			return () => {
				if ( source ) {
					source.close();
				}
				clearInterval( connectionTimer );
			};
		}
	}, [] );

	const needsReload = lastHash !== __webpack_hash__;

	let msg: string | null = null;
	if ( ! isConnected ) {
		msg = 'Webpack disconnected';
	} else if ( buildState === BuildState.BUILDING ) {
		msg = 'Webpack building…';
	} else if ( needsReload ) {
		msg = 'Need to refresh';
	} else if ( buildState === BuildState.ERROR ) {
		msg = 'Webpack error';
	}

	return msg ? (
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
	) : null;
};

export default WebpackBuildMonitor;
