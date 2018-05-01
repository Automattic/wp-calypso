/** @format */
/* eslint-disable no-console */

/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import io from 'socket.io-client';
import { find, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import Spinner from 'components/spinner';

const MESSAGE_STATUS_MAP = {
	'Building CSS…': { isBuildingCss: true },
	'CSS build failed': { hasError: true },
	'Reloading CSS: ': { isBuildingCss: false },
	'[HMR] Cannot find update (Full reload needed)': { needsReload: true },
	'webpack building...': { isBuildingJs: true },
	'webpack built ': { isBuildingJs: false },
	'[HMR] connected': { isConnected: true },
	"[HMR] The following modules couldn't be hot updated": { needsReload: true },
	'[WDS] Disconnected!': { isConnected: false },
	'[WDS] Nothing changed.': { isBuildingJs: false },
};

let buildState = {
	hasError: false,
	isBuildingCss: false,
	isBuildingJs: false,
	isConnected: true,
	needsReload: false,
	stateUpdater: null,
};

const hmrLogger = message => {
	const stateUpdates = find( MESSAGE_STATUS_MAP, ( v, prefix ) => startsWith( message, prefix ) );

	if ( stateUpdates && 'function' === typeof buildState.stateUpdater ) {
		buildState = { ...buildState, ...stateUpdates };
		buildState.stateUpdater( buildState );
	}
};

window.hmrLogger = hmrLogger;

io
	.connect( location.protocol + '//' + location.host + '/css-hot-reload' )
	.on( 'css-hot-reload', function( data ) {
		switch ( data.status ) {
			case 'reload':
				return hmrLogger( 'Reloading CSS: ' );
			case 'building':
				return hmrLogger( 'Building CSS…' );
			case 'build-failed':
				return hmrLogger( 'CSS build failed.' );
		}
	} );

io
	.connect( location.protocol + '//' + location.host + '/webpack-build-monitor' )
	.on( 'message', hmrLogger );

const socket = io.connect( location.protocol + '//' + location.host + '/' );
socket.on( 'connect', ( ...oargs ) => {
	console.log( '~io~> ', ...oargs );

	socket.on( 'message', ( ...args ) => console.log( '~io~> ', ...args ) );
} );

module &&
	module.hot &&
	module.hot.addStatusHandler &&
	( () => {
		let lastStatus;

		module.hot.addStatusHandler(
			status => (
				console.log( status ),
				lastStatus === 'apply' &&
					status === 'idle' &&
					hmrLogger( "[HMR] The following modules couldn't be hot updated" ),
				( lastStatus = status )
			)
		);
	} )();

const getMessage = ( { hasError, isBuildingCss, isBuildingJs, isConnected } ) => {
	if ( ! isConnected ) {
		return 'Dev Server disconnected';
	}

	if ( hasError ) {
		return 'Build error';
	}

	if ( isBuildingCss && isBuildingJs ) {
		return 'Rebuilding JS and CSS';
	}

	if ( isBuildingCss ) {
		return 'Building CSS';
	}

	if ( isBuildingJs ) {
		return 'Rebuilding JavaScript';
	}

	return '';
};

let alreadyExists = false;

class WebpackBuildMonitor extends React.PureComponent {
	state = buildState;

	componentDidMount() {
		if ( alreadyExists ) {
			return console.error(
				'There should only be a single build monitor loaded. ' +
					"Please make sure we're not trying to load more than one at a time."
			);
		}
		alreadyExists = true;

		buildState.stateUpdater = state => this.setState( state );
	}

	render() {
		const { hasError, isBuildingCss, isBuildingJs, isConnected, needsReload } = this.state;

		const isBusy = isBuildingCss || isBuildingJs;

		if ( ! isBusy && needsReload ) {
			return <div className="webpack-build-monitor is-warning">Need to refresh</div>;
		}

		// if we're not doing anything
		// then we don't need to show anything
		if ( ! isBusy ) {
			return null;
		}

		return (
			<div
				className={ classNames( 'webpack-build-monitor', {
					'is-error': hasError || ! isConnected,
					'is-warning': needsReload,
				} ) }
			>
				{ isBusy && <Spinner size={ 11 } className="webpack-build-monitor__spinner" /> }
				{ getMessage( this.state ) }
			</div>
		);
	}
}

export default WebpackBuildMonitor;
