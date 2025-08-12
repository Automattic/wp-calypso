import '@automattic/calypso-polyfills';
import { setLocale } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Notifications, { refreshNotes } from '../panel/Notifications';
import { createClient } from './client';
import { receiveMessage, sendMessage } from './messaging';
const debug = require( 'debug' )( 'notifications:standalone' );

import '../panel/boot/stylesheets/style.scss';

const localePattern = /[&?]locale=([\w_-]+)/;
const match = localePattern.exec( document.location.search );
const locale = match ? match[ 1 ] : 'en';

const fetchLocale = async ( localeSlug ) => {
	try {
		const response = await fetch(
			`https://widgets.wp.com/notifications/languages/${ localeSlug }-v1.1.json`
		);

		// Fall back to English if the locale is not available
		if ( ! response.ok ) {
			return;
		}

		// Set the locale for the i18n-calypso library
		setLocale( await response.json() );
	} catch {}
};

let store = { dispatch: () => {}, getState: () => {} };
const customEnhancer = ( next ) => ( reducer, initialState ) =>
	( store = next( reducer, initialState ) );

const ACTION_HANDLERS = {
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
	CLOSE_SHORTCUTS_POPOVER: [ () => sendMessage( { action: 'closeShortcutsPopover' } ) ],
	TOGGLE_SHORTCUTS_POPOVER: [ () => sendMessage( { action: 'toggleShortcutsPopover' } ) ],
	EDIT_COMMENT: [
		( st, { siteId, postId, commentId, href } ) => {
			sendMessage( { action: 'editComment', siteId, postId, commentId } );
			window.open( href, '_blank' );
		},
	],
	ANSWER_PROMPT: [
		( st, { siteId, href } ) => {
			sendMessage( { action: 'answerPrompt', siteId, href } );
			window.open( href, '_blank' );
		},
	],
};

const NotesWrapper = ( { wpcom } ) => {
	const [ isShowing, setIsShowing ] = useState( false );
	const [ isVisible, setIsVisible ] = useState( document.visibilityState === 'visible' );
	const [ isShortcutsPopoverVisible, setShortcutsPopoverVisible ] = useState( false );

	if ( locale && 'en' !== locale ) {
		fetchLocale( locale );
	}

	debug( 'wrapper state update', { isShowing, isVisible } );

	const refresh = () =>
		setIsVisible( ( prevIsVisible ) => {
			store.dispatch( { type: 'APP_REFRESH_NOTES', isVisible: prevIsVisible } );
			return prevIsVisible;
		} );
	const reset = () => store.dispatch( { type: 'SELECT_NOTE', noteId: null } );

	const refreshShortcutsPopover = ( type ) => {
		store.dispatch( { type } );
	};

	const handleMessages = ( { action, hidden, showing } ) => {
		debug( 'message received', {
			action,
			hidden,
			showing,
		} );

		if ( 'togglePanel' === action ) {
			setIsShowing( ( prevIsShowing ) => {
				if ( prevIsShowing && ! showing ) {
					reset();
				}
				return showing;
			} );
			refresh();
		}

		if ( 'closeShortcutsPopover' === action ) {
			setShortcutsPopoverVisible( false );
			refreshShortcutsPopover( 'CLOSE_SHORTCUTS_POPOVER' );
		}

		if ( 'toggleShortcutsPopover' === action ) {
			setShortcutsPopoverVisible( ! isShortcutsPopoverVisible );
			refreshShortcutsPopover( 'TOGGLE_SHORTCUTS_POPOVER' );
		}

		if ( 'toggleVisibility' === action ) {
			setIsVisible( ! hidden );
			refresh();
		}

		if ( 'refreshNotes' === action ) {
			refreshNotes();
		}
	};

	useEffect( () => {
		document.addEventListener( 'visibilitychange', refresh );

		window.addEventListener( 'message', receiveMessage( handleMessages ) );

		// Ensure empty dependency array so we only add these listeners once. The functionality of
		// refresh and handleMessages will not change after initial mount. Alternatively caching
		// these functions to pass into this dependency array would use extra resources
		// unnecessarily.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return (
		<Notifications
			customEnhancer={ customEnhancer }
			actionHandlers={ ACTION_HANDLERS }
			isShowing={ isShowing }
			isVisible={ isVisible }
			locale={ locale }
			receiveMessage={ sendMessage }
			redirectPath="/"
			wpcom={ wpcom }
			forceLocale
		/>
	);
};

const render = ( wpcom ) => {
	document.body.classList.add( 'font-smoothing-antialiased' );

	ReactDOM.render(
		<NotesWrapper wpcom={ wpcom } />,
		document.getElementsByClassName( 'wpnc__main' )[ 0 ]
	);
};

const setTracksUser = ( wpcom ) => {
	wpcom.req
		.get( '/me', { fields: 'ID,username' } )
		.then( ( { ID, username } ) => {
			window._tkq = window._tkq || [];
			window._tkq.push( [ 'identifyUser', ID, username ] );
		} )
		.catch( () => {} );
};

const init = ( wpcom ) => {
	setTracksUser( wpcom );
	render( wpcom );
};

createClient().then( init );
