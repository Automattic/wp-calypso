import '@automattic/calypso-polyfills';
import { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import Notifications, { refreshNotes } from '../panel/Notifications';
import { createClient } from './client';
import { receiveMessage, sendMessage } from './messaging';
const debug = require( 'debug' )( 'notifications:standalone' );

import '../panel/boot/stylesheets/style.scss';

const localePattern = /[&?]locale=([\w_-]+)/;
const match = localePattern.exec( document.location.search );
const locale = match ? match[ 1 ] : 'en';

let store = { dispatch: () => {}, getState: () => {} };
const customEnhancer = ( next ) => ( reducer, initialState ) =>
	( store = next( reducer, initialState ) );

const customMiddleware = {
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

function useStorageAccess() {
	const [ hasAccess, setAccess ] = useState( null );

	useEffect( () => {
		document.hasStorageAccess().then( ( value ) => setAccess( value ) );
	}, [] );

	const requestAccess = useCallback( () => {
		document
			.requestStorageAccess()
			.then( () => setAccess( true ) )
			.catch( ( error ) => {
				// eslint-disable-next-line no-console
				console.error( 'requestStorageAccess failed:', error );
				setAccess( false );
			} );
	}, [] );

	return {
		hasAccess,
		requestAccess,
	};
}

const setTracksUser = ( wpcom ) => {
	return wpcom
		.me()
		.get( { fields: 'ID,username' } )
		.then( ( { ID, username } ) => {
			window._tkq = window._tkq || [];
			window._tkq.push( [ 'identifyUser', ID, username ] );
		} )
		.catch( () => {} );
};

async function createAndSetupClient() {
	const wpcom = await createClient();
	await setTracksUser( wpcom );
	return wpcom;
}

const NotesWrapper = () => {
	const [ isShowing, setIsShowing ] = useState( false );
	const [ isVisible, setIsVisible ] = useState( document.visibilityState === 'visible' );
	const [ isShortcutsPopoverVisible, setShortcutsPopoverVisible ] = useState( false );
	const { hasAccess, requestAccess } = useStorageAccess();
	const [ wpcom, setWpcom ] = useState( null );

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

	useEffect( () => {
		sendMessage( { action: 'iFrameReady' } );
	}, [] );

	useEffect( () => {
		if ( ! wpcom && hasAccess ) {
			createAndSetupClient().then( ( c ) => setWpcom( c ) );
		}
	}, [ wpcom, hasAccess ] );

	if ( hasAccess === null ) {
		return null;
	}

	if ( hasAccess === false ) {
		return (
			<div className="wpnc__note-list wpnc__loading">
				<button
					className="wpnc__button"
					style={ { margin: '0px auto' } }
					onClick={ () => requestAccess() }
				>
					Request Access
				</button>
			</div>
		);
	}

	if ( ! wpcom ) {
		return <div className="wpnc__note-list wpnc__loading">Loading wpcom</div>;
	}

	return (
		<Notifications
			customEnhancer={ customEnhancer }
			customMiddleware={ customMiddleware }
			isShowing={ isShowing }
			isVisible={ isVisible }
			locale={ locale }
			receiveMessage={ sendMessage }
			redirectPath="/"
			wpcom={ wpcom }
		/>
	);
};

const render = () => {
	document.body.classList.add( 'font-smoothing-antialiased' );

	const root = ReactDOM.createRoot( document.querySelector( '.wpnc__main' ) );
	root.render( <NotesWrapper /> );
};

render();
