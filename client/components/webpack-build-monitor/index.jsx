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

const CONNECTED = 'CONNECTED';
const DISCONNECTED = 'DISCONNECTED';
const NEEDS_RELOAD = 'NEEDS_RELOAD';
const BUILDING_CSS = 'BUILDING_CSS';
const BUILDING_JS = 'BUILDING_JS';
const BUILDING_BOTH = 'BUILDING_BOTH';
const ERROR = 'ERROR';
const IDLE = 'IDLE';

const doneBuilding = typeDone => state => {
	if ( state === ERROR || state === NEEDS_RELOAD ) {
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
	"[HMR] The following modules couldn't be hot updated": () => NEEDS_RELOAD,
};

const reducer = ( state = IDLE, { type, message } ) => {
	// only listen for WebpackBuildMessages and also never change from a NEEDS_RELOAD state
	if ( type !== 'WebpackBuildMessage' || state === NEEDS_RELOAD ) {
		return state;
	}

	const getNextState =
		find( MESSAGE_STATUS_MAP, ( v, messagePrefix ) => startsWith( message, messagePrefix ) ) ||
		identity;

	return getNextState( state );
};

const store = createStore( reducer );

const wrapConsole = fn => ( message, ...args ) => {
	store.dispatch( { type: 'WebpackBuildMessage', message } );
	fn.call( window, message, ...args );
};

console.error = wrapConsole( console.error );
console.warn = wrapConsole( console.warn );
console.log = wrapConsole( console.log );

const STATUS_TEXTS = {
	[ DISCONNECTED ]: 'Dev Server disconnected',
	[ NEEDS_RELOAD ]: 'Need to refresh',
	[ ERROR ]: 'Build error',
	[ BUILDING_JS ]: 'Rebuilding Javascript',
	[ BUILDING_CSS ]: 'Rebuilding CSS',
	[ BUILDING_BOTH ]: 'Rebuilding JS and CSS',
};

class WebpackBuildMonitor extends React.Component {
	state = { status: IDLE };

	componentDidMount() {
		this.unsubscribe = store.subscribe( () => {
			const status = store.getState();
			if ( status !== this.state.status ) {
				this.setState( { status: store.getState() } );
			}
		} );
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	render() {
		const { status } = this.state;

		const text = STATUS_TEXTS[ status ];

		if ( status === IDLE || ! text ) {
			return null;
		}

		const classnames = classNames( 'webpack-build-monitor', {
			'is-error': status === ERROR || status === DISCONNECTED,
		} );

		return (
			<div className={ classnames }>
				{ includes( [ BUILDING_BOTH, BUILDING_CSS, BUILDING_JS ], status ) &&
					<Spinner size={ 11 } className="webpack-build-monitor__spinner" /> }
				{ text }
			</div>
		);
	}
}

export default WebpackBuildMonitor;
