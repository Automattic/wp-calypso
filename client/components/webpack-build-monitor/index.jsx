/* eslint-disable no-console */

/**
 * External dependencies
 */
import React from 'react';
import { createStore } from 'redux';
import cx from 'classnames';
import { startsWith, find, includes } from 'lodash';

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

const buildJS = state => ( state === BUILDING_CSS ? BUILDING_BOTH : BUILDING_JS );
const buildCSS = state => ( state === BUILDING_JS ? BUILDING_BOTH : BUILDING_CSS );

const MESSAGE_STATUS_MAP = {
	'[HMR] connected': () => CONNECTED,
	'[WDS] Disconnected!': () => DISCONNECTED,
	'[HMR] bundle rebuilding': state => buildJS( state ),
	'Building CSS…': state => buildCSS( state ),
	'CSS build failed': () => ERROR,
	'[WDS] Nothing changed.': doneBuilding( BUILDING_JS ),
	'Reloading CSS: ': doneBuilding( BUILDING_CSS ),
	'[HMR] bundle rebuilt in': doneBuilding( BUILDING_JS ),
	"[HMR] The following modules couldn't be hot updated": () => NEEDS_RELOAD,
};

const reducer = ( state = IDLE, { message } ) => {
	const getNextState = find( MESSAGE_STATUS_MAP, ( v, messagePrefix ) =>
		startsWith( message, messagePrefix ),
	);

	return getNextState ? getNextState( state ) : state;
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
	[ BUILDING_BOTH ]: 'Rebuiling both JS and CSS',
};

class WebpackBuildMonitor extends React.Component {
	state = { status: IDLE };

	componentDidMount() {
		this.unsubscribe = store.subscribe( () => this.setState( { status: store.getState() } ) );
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

		const classnames = cx( 'webpack-build-monitor', {
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
