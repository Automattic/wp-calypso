/* eslint-disable no-console */
/* eslint-disable wpcalypso/import-no-redux-combine-reducers */

/**
 * External dependencies
 */
import React from 'react';
import { createStore, combineReducers } from 'redux';
import cx from 'classnames';

/**
 * Internal dependencies
 */
import Spinner from 'components/spinner';

const CONNECTED = 'CONNECTED';
const DISCONNECTED = 'DISCONNECTED';
const NEEDS_RELOAD = 'NEEDS_RELOAD';
const STATUS_BUILDING = 'STATUS_BUILDING';
const STATUS_ERROR = 'STATUS_ERROR';
const STATUS_IDLE = 'STATUS_IDLE';

const cssStatusReducer = ( state = STATUS_IDLE, { message } ) => {
	switch ( message ) {
		case 'Building CSS…':
			return STATUS_BUILDING;
		case 'Reloading CSS: ':
			return STATUS_IDLE;
	}
	return state;
};

const jsStatusReducer = ( state = STATUS_IDLE, { message } ) => {
	switch ( message ) {
		case '[WDS] App updated. Recompiling...':
			return STATUS_BUILDING;
		case '[HMR] App is up to date.':
		case '[WDS] Nothing changed.':
			// Once completed, set the status to idle unless there's an error
			return state === STATUS_ERROR ? state : STATUS_IDLE;
		case '[WDS] Errors while compiling.':
			return STATUS_ERROR;
		case '[WDS] App hot update...':
			return STATUS_IDLE;
	}
	return state;
};

const wdsStatusReducer = ( state = CONNECTED, { message } ) => {
	switch ( message ) {
		case '[WDS] Disconnected!':
			return DISCONNECTED;
		case '[WDS] Hot Module Replacement enabled.':
			return CONNECTED;
		case '[HMR] Cannot find update. Need to do a full reload!':
		case `[HMR] The following modules couldn't be hot updated: (They would need a full reload!)`: // eslint-disable-line
			return NEEDS_RELOAD;
	}
	return state;
};

// Reducer for the component state
const reduce = combineReducers(
	{ cssStatus: cssStatusReducer, jsStatus: jsStatusReducer, wdsStatus: wdsStatusReducer },
);
const store = createStore( reduce );

const wrapConsole = fn => ( message, ...args ) => {
	store.dispatch( { type: 'WebpackBuildLog', message } );
	fn.call( window, message, ...args );
};

console.error = wrapConsole( console.error );
console.warn = wrapConsole( console.warn );
console.log = wrapConsole( console.log );

class WebpackBuildMonitor extends React.Component {
	componentDidMount() {
		this.unsubscribe = store.subscribe( () => this.setState( store.getState() ) );
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	render() {
		const { cssStatus, jsStatus, wdsStatus } = store.getState();

		const isDisconnected = wdsStatus === DISCONNECTED;
		const needsReload = wdsStatus === NEEDS_RELOAD;
		const isError = cssStatus === STATUS_ERROR || jsStatus === STATUS_ERROR;
		const isBuilding = cssStatus === STATUS_BUILDING || jsStatus === STATUS_BUILDING;

		const text =
			( isDisconnected && 'Dev Server disconnected' ) ||
			( needsReload && 'Need to refresh' ) ||
			( isError && 'Build error' ) ||
			( isBuilding && 'Rebuilding' );

		const classnames = cx( 'webpack-build-monitor', {
			'is-error': isError,
		} );

		if ( ! isBuilding && ! isDisconnected && ! needsReload ) {
			return null;
		}

		return (
			<div className={ classnames }>
				{ isBuilding && <Spinner size={ 11 } className="webpack-build-monitor__spinner" /> }
				{ text }
			</div>
		);
	}
}

export default WebpackBuildMonitor;
