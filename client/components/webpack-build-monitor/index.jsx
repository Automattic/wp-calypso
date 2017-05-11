/* eslint-disable no-console */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Spinner from 'components/spinner';

const CONNECTED = 'CONNECTED';
const DISCONNECTED = 'DISCONNECTED';
const STATUS_BUILDING = 'STATUS_BUILDING';
const STATUS_ERROR = 'STATUS_ERROR';
const STATUS_IDLE = 'STATUS_IDLE';

// Reducer for the CSS build status
const cssStatus = ( state = STATUS_IDLE, message ) => {
	switch ( message ) {
		case 'Building CSS…':
			return STATUS_BUILDING;
		case 'Reloading CSS: ':
			return STATUS_IDLE;
	}
	return state;
};

// Reducer for the JS build status
const jsStatus = ( state = STATUS_IDLE, message ) => {
	switch ( message ) {
		case '[WDS] App updated. Recompiling...':
			return STATUS_BUILDING;
		case '[HMR] App is up to date.':
		case '[WDS] Nothing changed.':
			// Once completed, set the status to idle unless there's an error
			return state === STATUS_ERROR ? state : STATUS_IDLE;
		case '[WDS] Errors while compiling.':
			return STATUS_ERROR;
	}
	return state;
};

// Reducer for the Webpack Dev Server status
const wdsStatus = ( state = CONNECTED, message ) => {
	switch ( message ) {
		case '[WDS] Disconnected!':
			return DISCONNECTED;
	}
	return state;
};

// Reducer for the component state
const getState = ( state = {}, message ) => {
	return {
		cssStatus: cssStatus( state.cssStatus, message ),
		jsStatus: jsStatus( state.jsStatus, message ),
		wdsStatus: wdsStatus( state.wdsStatus, message ),
	};
};

class WebpackBuildMonitor extends React.Component {
	constructor() {
		super();
		this.state = getState();

		// Spy on console to watch for messages from Webpack Dev Server
		console.error = this.wrapConsoleFn( console.error );
		console.log = this.wrapConsoleFn( console.log );
	}

	wrapConsoleFn = ( fn ) => ( message ) => {
		this.setState( getState( this.state, message ) );
		fn.call( this, message );
	}

	render() {
		if ( this.state.wdsStatus === DISCONNECTED ) {
			return (
				<div className="webpack-build-monitor is-error">
					Dev server disconnected
				</div>
			);
		}

		if ( this.state.cssStatus === STATUS_ERROR || this.state.jsStatus === STATUS_ERROR ) {
			return (
				<div className="webpack-build-monitor is-error">
					Build error
				</div>
			);
		}

		if ( this.state.cssStatus === STATUS_BUILDING || this.state.jsStatus === STATUS_BUILDING ) {
			return (
				<div className="webpack-build-monitor ">
					<Spinner size={ 11 } className="webpack-build-monitor__spinner" />
					Rebuilding
				</div>
			);
		}

		return null;
	}
}

// QUESTIONS:
// - Worth saying whether it's JS or CSS that's loading/errored?
// - Worth adding a "dirty" state, or a fading message to confirm when HMR works?

export default WebpackBuildMonitor;
