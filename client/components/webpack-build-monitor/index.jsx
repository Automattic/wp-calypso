/** @format */
/* eslint-disable no-console */

/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { find, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import Spinner from 'components/spinner';

const MESSAGE_STATUS_MAP = {
	'[HMR] connected': { isConnected: true },
	'[WDS] Disconnected!': { isConnected: false },
	'[HMR] bundle rebuilding': { isBuildingJs: true },
	'[HMR] Cannot find update (Full reload needed)': { needsReload: true },
	"[HMR] The following modules couldn't be hot updated": { needsReload: true },
	'Building CSS…': { isBuildingCss: true },
	'CSS build failed': { hasError: true },
	'[WDS] Nothing changed.': { isBuildingJs: false },
	'Reloading CSS: ': { isBuildingCss: false },
	'[HMR] bundle rebuilt in': { isBuildingJs: false },
};

let buildState = {
	hasError: false,
	isBuildingCss: false,
	isBuildingJs: false,
	isConnected: true,
	needsReload: false,
};

const interceptConsole = ( consoleObject, updater ) => {
	[ 'error', 'log', 'warn' ].forEach( method => {
		const unwrapped = consoleObject[ method ];

		consoleObject[ method ] = ( msg, ...args ) => {
			const stateUpdates = find( MESSAGE_STATUS_MAP, ( v, prefix ) => startsWith( msg, prefix ) );

			if ( stateUpdates ) {
				buildState = { ...buildState, ...stateUpdates };
				updater( buildState );
			}

			unwrapped.apply( console, [ msg, ...args ] );
		};
	} );
};

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

		interceptConsole( console, state => this.setState( state ) );
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
