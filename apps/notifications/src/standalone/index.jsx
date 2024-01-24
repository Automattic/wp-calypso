import '@automattic/calypso-polyfills';
import { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Notifications, { refreshNotes } from '../panel/Notifications';
import { createClient } from './client';
import { receiveMessage, sendMessage } from './messaging';

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

function NotificationsApp() {
	const { hasAccess, requestAccess } = useStorageAccess();
	const [ wpcom, setWpcom ] = useState( null );

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
			<div style={ { background: '#f6f7f7', padding: '10px' } }>
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
		return null;
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
}

const render = () => {
	document.body.classList.add( 'font-smoothing-antialiased' );

	ReactDOM.render( <NotificationsApp />, document.getElementsByClassName( 'wpnc__main' )[ 0 ] );
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
