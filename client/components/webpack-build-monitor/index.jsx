/* eslint-disable no-console */

/**
 * External dependencies
 */
import React from 'react';
import { createStore } from 'redux';
import cx from 'classnames';

/**
 * Internal dependencies
 */
import Spinner from 'components/spinner';

const CONNECTED = 'CONNECTED';
const DISCONNECTED = 'DISCONNECTED';
const NEEDS_RELOAD = 'NEEDS_RELOAD';
const BUILDING = 'BUILDING';
const ERROR = 'ERROR';
const IDLE = 'IDLE';

const reducer = ( state = IDLE, { message } ) => {
	switch ( message ) {
		case '[WDS] Hot Module Replacement enabled.':
			return CONNECTED;
		case '[WDS] Disconnected!':
			return DISCONNECTED;
		case '[WDS] App updated. Recompiling...':
		case 'Building CSS…':
			return BUILDING;
		case '[HMR] App is up to date.':
		case '[WDS] Nothing changed.':
		case '[WDS] App hot update...':
		case 'Reloading CSS: ':
			// Once completed, set the status to idle unless there's an error
			return state === ERROR || state === NEEDS_RELOAD ? state : IDLE;
		case '[WDS] Errors while compiling.':
			return ERROR;
		case '[HMR] Cannot find update. Need to do a full reload!':
		case `[HMR] The following modules couldn't be hot updated: (They would need a full reload!)`: // eslint-disable-line
			return state === ERROR ? ERROR : NEEDS_RELOAD;
	}
	return state;
};

const store = createStore( reducer );

const wrapConsole = fn => ( message, ...args ) => {
	store.dispatch( { type: 'WebpackBuildMessage', message } );
	fn.call( window, message, ...args );
};

console.error = wrapConsole( console.error );
console.warn = wrapConsole( console.warn );
console.log = wrapConsole( console.log );

class WebpackBuildMonitor extends React.Component {
	componentDidMount() {
		this.unsubscribe = store.subscribe( () => this.setState( { status: store.getState() } ) );
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	render() {
		const status = store.getState();
		const text =
			( status === DISCONNECTED && 'Dev Server disconnected' ) ||
			( status === NEEDS_RELOAD && 'Need to refresh' ) ||
			( status === ERROR && 'Build error' ) ||
			( status === BUILDING && 'Rebuilding' );
		const classnames = cx( 'webpack-build-monitor', {
			'is-error': status === ERROR || status === DISCONNECTED,
		} );

		if ( status === IDLE ) {
			return null;
		}

		return (
			<div className={ classnames }>
				{ status === BUILDING &&
					<Spinner size={ 11 } className="webpack-build-monitor__spinner" /> }
				{ text }
			</div>
		);
	}
}

export default WebpackBuildMonitor;
