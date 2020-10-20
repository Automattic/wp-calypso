/**
 * External dependencies
 */
import React, { FunctionComponent, useEffect, useState } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Spinner from 'calypso/components/spinner';
import connectToWebpackServer, { BuildState } from './webpack-client';

/**
 * Style dependencies
 */
import './style.scss';

function getMessage( buildState: BuildState ) {
	switch ( buildState ) {
		case BuildState.DISCONNECTED:
			return 'Disconnected';
		case BuildState.BUILDING:
			return 'Building…';
		case BuildState.UPDATING:
			return 'Hot updating…';
		case BuildState.NEEDS_RELOAD:
			return 'Need to refresh';
		case BuildState.ERROR:
			return 'Build failed';
		case BuildState.INITIAL: // don't show anything until connected for the first time
		default:
			return null;
	}
}

const WebpackBuildMonitor: FunctionComponent = () => {
	const [ buildState, setBuildState ] = useState( BuildState.INITIAL );

	useEffect( () => connectToWebpackServer( setBuildState ), [] );

	const msg = getMessage( buildState );
	if ( ! msg ) {
		return null;
	}

	const isError = buildState === BuildState.ERROR || buildState === BuildState.DISCONNECTED;
	const isWarning = buildState === BuildState.NEEDS_RELOAD;
	const isSpinning = buildState === BuildState.BUILDING || buildState === BuildState.UPDATING;

	const className = classNames( 'webpack-build-monitor', {
		'is-error': isError,
		'is-warning': isWarning,
	} );

	return (
		<div className={ className }>
			{ isSpinning && <Spinner size={ 11 } className="webpack-build-monitor__spinner" /> }
			{ msg }
		</div>
	);
};

export default WebpackBuildMonitor;
