/* global __webpack_hash__ */
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
import io from 'socket.io-client';

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

const WebpackBuildMonitor: FunctionComponent = () => {
	const [ lastHash, setLastHash ] = useState( __webpack_hash__ );

	// Webpack
	const [ isHmrConnected, setIsHmrConnected ] = useState( false );
	const [ hasWebpackErrors, setHasWebpackErrors ] = useState( false );
	const [ hasWebpackWarnings, setHasWebpackWarnings ] = useState( false );
	const [ isWebpackBuilding, setWebpackBuilding ] = useState( false );

	// CSS
	const [ isCssConnected, setIsCssConnected ] = useState( false );
	const [ hasCssErrors, setHasCssErrors ] = useState( false );
	const [ isCssBuilding, setCssBuilding ] = useState( false );

	useEffect( () => {
		const namespace = location.protocol + '//' + location.host + '/css-hot-reload';

		let socket;

		const connect = () => {
			debug( 'Hot CSS connecting' );
			socket = io.connect( namespace );
			socket.on( 'connect', () => {
				debug( 'Hot CSS connected' );
				setIsCssConnected( true );
			} );

			socket.on( 'disconnect', () => {
				debug( 'Hot CSS disconnected. Reconnecting…' );
				setIsCssConnected( false );
				setTimeout( connect, CONNECTION_TIMEOUT );
			} );

			socket.on(
				'css-hot-reload',
				( { status }: { status: 'building' | 'build-failed' | 'reload' | 'up-to-date' } ) => {
					debug( 'Hot CSS status update: %o', status );
					switch ( status ) {
						case 'building':
							setCssBuilding( true );
							break;

						case 'build-failed':
							setHasCssErrors( true );
							setCssBuilding( false );
							break;

						case 'reload':
						case 'up-to-date':
							setHasCssErrors( false );
							setCssBuilding( false );
							break;
					}
				}
			);
		};

		connect();

		return () => {
			if ( socket && ! socket.disconnected ) {
				socket.close();
			}
		};
	}, [] );

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
					setIsHmrConnected( true );
					lastActivity = Date.now();
					connectionTimer = setInterval( () => {
						if ( Date.now() - lastActivity > CONNECTION_TIMEOUT ) {
							debug( 'Webpack HMR connection timeout. Reconnecting in %o…', CONNECTION_TIMEOUT );
							setIsHmrConnected( false );
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
						let nextHash;

						try {
							const parsedData = JSON.parse( m.data );
							debug( 'Webpack HMR message: %o', parsedData );
							action = parsedData.action;
							nextErrors = parsedData.errors;
							nextWarnings = parsedData.warnings;
							nextHash = parsedData.hash;
						} catch ( err ) {
							debug( 'Could not parse HMR message.data %o', m.data );
						}

						switch ( action ) {
							case 'building':
								setWebpackBuilding( true );
								setHasWebpackErrors( false );
								setHasWebpackWarnings( false );
								break;

							case 'built':
								setWebpackBuilding( false );
							// fall through
							case 'sync':
								setHasWebpackErrors( !! nextErrors.length );
								setHasWebpackWarnings( !! nextWarnings.length );
								setLastHash( nextHash );
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
				if ( connectionTimer ) {
					clearInterval( connectionTimer );
				}
			};
		}
	}, [] );

	const isConnected = isHmrConnected && isCssConnected;
	const isBuilding = isCssBuilding || isWebpackBuilding;
	const hasErrors = hasCssErrors || hasWebpackErrors;

	const needsReload = lastHash !== __webpack_hash__;

	/* eslint-disable no-nested-ternary */
	const msg = ! isConnected
		? 'Not connected'
		: isWebpackBuilding && isCssBuilding
		? 'Webpack and CSS Building…'
		: isWebpackBuilding
		? 'Webpack building…'
		: isCssBuilding
		? 'CSS Building…'
		: needsReload
		? 'Need to refresh'
		: hasWebpackErrors && hasCssErrors
		? 'Webpack & CSS error'
		: hasWebpackErrors
		? 'Webpack error'
		: hasCssErrors
		? 'CSS error'
		: null;
	/* eslint-enable no-nested-ternary */

	return (
		msg && (
			<div
				className={ classNames( 'webpack-build-monitor', {
					'is-error': hasErrors,
					'is-warning': hasWebpackWarnings || needsReload,
				} ) }
			>
				{ isBuilding && <Spinner size={ 11 } className="webpack-build-monitor__spinner" /> }
				{ msg }
			</div>
		)
	);
};

export default WebpackBuildMonitor;
