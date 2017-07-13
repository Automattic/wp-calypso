/* eslint-disable no-console */

/**
 * External dependencies
 */
import React from 'react';
import { createStore } from 'redux';
import cx from 'classnames';
import { startsWith } from 'lodash';

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

// Once completed, set the status to idle unless there's an error
const doneBuilding = state => ( state === ERROR || state === NEEDS_RELOAD ? state : IDLE );

const MESSAGE_STATUS_MAP = {
	'[HMR] connected': () => CONNECTED,
	'[WDS] Disconnected!': () => DISCONNECTED,
	'[HMR] bundle rebuilding': () => BUILDING,
	'Building CSS…': () => BUILDING,
	'[HMR] App is up to date.': doneBuilding,
	'[WDS] Nothing changed.': doneBuilding,
	'[WDS] App hot update...': doneBuilding,
	'Reloading CSS: ': doneBuilding,
	'[WDS] Errors while compiling.': () => ERROR,
	'[HMR] Cannot find update. Need to do a full reload!': NEEDS_RELOAD,
};

const isDoneBuilding = msg => startsWith( msg, '[HMR] bundle rebuilt in' );
const needsReload = msg => startsWith( msg, '[HMR]  - ./client' );

const reducer = ( state = IDLE, { message } ) => {
	if ( message in MESSAGE_STATUS_MAP ) {
		return MESSAGE_STATUS_MAP[ message ]( state );
	} else if ( isDoneBuilding( message ) ) {
		return doneBuilding( state );
	} else if ( needsReload ) {
		return NEEDS_RELOAD;
	}

	return state;
};

const store = createStore( reducer );

const wrapConsole = fn => ( message, ...args ) => {
	if ( message in MESSAGE_STATUS_MAP || isDoneBuilding( message ) || needsReload( message ) ) {
		store.dispatch( { type: 'WebpackBuildMessage', message } );
	}
	fn.call( window, message, ...args );
};

console.error = wrapConsole( console.error );
console.warn = wrapConsole( console.warn );
console.log = wrapConsole( console.log );

class WebpackBuildMonitor extends React.Component {
	state = { status: IDLE };

	componentDidMount() {
		this.unsubscribe = store.subscribe( () => {
			this.setState( { status: store.getState() } );
		} );
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	render() {
		const { status } = this.state;
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
