/** @format */
/* eslint-disable no-console */

/**
 * External dependencies
 */
import React from 'react';
import { createStore } from 'redux';
import classNames from 'classnames';
import { find, includes, startsWith, identity } from 'lodash';

/**
 * Internal dependencies
 */
import Spinner from 'components/spinner';
import { combineReducers } from 'state/utils';

// Action dispatched by wrapped console
const CONSOLE_MESSAGE = 'CONSOLE_MESSAGE';

const CONNECTED = 'CONNECTED';
const DISCONNECTED = 'DISCONNECTED';
const BUILDING_CSS = 'BUILDING_CSS';
const BUILDING_JS = 'BUILDING_JS';
const BUILDING_BOTH = 'BUILDING_BOTH';
const ERROR = 'ERROR';
const IDLE = 'IDLE';

const doneBuilding = typeDone => state => {
	if ( state === ERROR ) {
		return state;
	} else if ( state === BUILDING_BOTH ) {
		return typeDone === BUILDING_JS ? BUILDING_CSS : BUILDING_JS;
	}
	return IDLE;
};

const buildJs = state => ( state === BUILDING_CSS ? BUILDING_BOTH : BUILDING_JS );
const buildCss = state => ( state === BUILDING_JS ? BUILDING_BOTH : BUILDING_CSS );

const MESSAGE_STATUS_MAP = {
	'[HMR] connected': () => CONNECTED,
	'[WDS] Disconnected!': () => DISCONNECTED,
	'[HMR] bundle rebuilding': state => buildJs( state ),
	'Building CSS…': state => buildCss( state ),
	'CSS build failed': () => ERROR,
	'[WDS] Nothing changed.': doneBuilding( BUILDING_JS ),
	'Reloading CSS: ': doneBuilding( BUILDING_CSS ),
	'[HMR] bundle rebuilt in': doneBuilding( BUILDING_JS ),
};

const buildStatusReducer = ( state = IDLE, { type, message } ) => {
	if ( type !== CONSOLE_MESSAGE ) {
		return state;
	}

	const getNextState =
		find( MESSAGE_STATUS_MAP, ( v, messagePrefix ) => startsWith( message, messagePrefix ) ) ||
		identity;

	return getNextState( state );
};

const reloadReducer = ( state = false, { type, message } ) => {
	if ( type !== CONSOLE_MESSAGE || state ) {
		return state;
	}

	if ( startsWith( message, "[HMR] The following modules couldn't be hot updated" ) ) {
		return true;
	}

	return state;
};

const store = createStore(
	combineReducers( {
		buildStatus: buildStatusReducer,
		reloadRequired: reloadReducer,
	} )
);

const wrapConsole = fn => ( message, ...args ) => {
	store.dispatch( { type: CONSOLE_MESSAGE, message } );
	fn.call( window, message, ...args );
};

console.error = wrapConsole( console.error );
console.warn = wrapConsole( console.warn );
console.log = wrapConsole( console.log );

const STATUS_TEXTS = {
	[ DISCONNECTED ]: 'Dev Server disconnected',
	[ ERROR ]: 'Build error',
	[ BUILDING_JS ]: 'Rebuilding Javascript',
	[ BUILDING_CSS ]: 'Rebuilding CSS',
	[ BUILDING_BOTH ]: 'Rebuilding JS and CSS',
};

const RELOAD_REQUIRED_ELEMENT = (
	// eslint-disable-next-line wpcalypso/jsx-classname-namespace
	<div className="webpack-build-monitor is-warning">Need to refresh</div>
);

class WebpackBuildMonitor extends React.Component {
	state = {
		buildStatus: IDLE,
		reloadRequired: false,
	};

	componentDidMount() {
		this.unsubscribe = store.subscribe( () => {
			const status = store.getState();
			if ( status !== this.state.status ) {
				this.setState( store.getState() );
			}
		} );
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	render() {
		const { buildStatus, reloadRequired } = this.state;

		if ( buildStatus === IDLE ) {
			return reloadRequired && RELOAD_REQUIRED_ELEMENT;
		}

		const text = STATUS_TEXTS[ buildStatus ] || '';

		const classnames = classNames( 'webpack-build-monitor', {
			'is-error': status === ERROR || status === DISCONNECTED,
			'is-warning': reloadRequired,
		} );

		return (
			<div className={ classnames }>
				{ includes( [ BUILDING_BOTH, BUILDING_CSS, BUILDING_JS ], buildStatus ) &&
					<Spinner size={ 11 } className="webpack-build-monitor__spinner" /> }
				{ text }
			</div>
		);
	}
}

export default WebpackBuildMonitor;
