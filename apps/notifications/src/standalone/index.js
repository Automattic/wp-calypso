/**
 * External dependencies
 */
import '@automattic/calypso-polyfills';
import ReactDOM from 'react-dom';
import React from 'react';

/**
 * Internal dependencies
 */
import Notifications, { refreshNotes } from '../panel/Notifications';
import AuthWrapper from './auth-wrapper';
import { receiveMessage, sendMessage } from './messaging';

/**
 * Style dependencies
 */
import '../panel/boot/stylesheets/style.scss';

const localePattern = /[&?]locale=([\w_-]+)/;
const match = localePattern.exec( document.location.search );
const locale = match ? match[ 1 ] : 'en';
let isShowing = true;
let isVisible = document.visibilityState === 'visible';

let store = { dispatch: () => {}, getState: () => {} };
const customEnhancer = ( next ) => ( reducer, initialState ) =>
	( store = next( reducer, initialState ) );

const customMiddleware = {
	APP_IS_READY: [ () => sendMessage( { action: 'iFrameReady' } ) ],
	APP_RENDER_NOTES: [
		( st, { latestType, newNoteCount } ) =>
			newNoteCount > 0
				? sendMessage( {
						action: 'render',
						num_new: newNoteCount,
						latest_type: latestType,
				  } )
				: sendMessage( { action: 'renderAllSeen' } ),
	],
	CLOSE_PANEL: [ () => sendMessage( { action: 'togglePanel' } ) ],
	OPEN_LINK: [ ( st, { href } ) => window.open( href, '_blank' ) ],
	OPEN_SITE: [
		( st, { siteId, href } ) => {
			sendMessage( { action: 'openSite', siteId } );
			window.open( href, '_blank' );
		},
	],
	OPEN_POST: [
		( st, { siteId, postId, href } ) => {
			sendMessage( { action: 'openPost', siteId, postId } );
			window.open( href, '_blank' );
		},
	],
	OPEN_COMMENT: [
		( st, { siteId, postId, commentId, href } ) => {
			sendMessage( { action: 'openComment', siteId, postId, commentId } );
			window.open( href, '_blank' );
		},
	],
	SET_LAYOUT: [
		( st, { layout } ) =>
			sendMessage( {
				action: 'widescreen',
				widescreen: layout === 'widescreen',
			} ),
	],
	VIEW_SETTINGS: [ () => window.open( 'https://wordpress.com/me/notifications' ) ],
	EDIT_COMMENT: [
		( st, { siteId, postId, commentId, href } ) => {
			sendMessage( { action: 'editComment', siteId, postId, commentId } );
			window.open( href, '_blank' );
		},
	],
};

const render = () => {
	ReactDOM.render(
		React.createElement( AuthWrapper( Notifications ), {
			clientId: 56641,
			customEnhancer,
			customMiddleware,
			isShowing,
			isVisible,
			locale,
			receiveMessage: sendMessage,
			redirectPath: '/',
		} ),
		document.getElementsByClassName( 'wpnc__main' )[ 0 ]
	);
};

const init = () => {
	render();

	const refresh = () => store.dispatch( { type: 'APP_REFRESH_NOTES', isVisible } );
	const reset = () => store.dispatch( { type: 'SELECT_NOTE', noteId: null } );

	document.addEventListener( 'visibilitychange', refresh );

	window.addEventListener(
		'message',
		receiveMessage( ( { action, hidden, showing } ) => {
			if ( 'togglePanel' === action ) {
				if ( isShowing && ! showing ) {
					reset();
				}

				isShowing = showing;
				refresh();
			}

			if ( 'toggleVisibility' === action ) {
				isVisible = ! hidden;
				refresh();
			}
		} )
	);

	window.addEventListener(
		'message',
		receiveMessage( ( { action } ) => {
			if ( 'refreshNotes' === action ) {
				refreshNotes();
			}
		} )
	);
};

init();
