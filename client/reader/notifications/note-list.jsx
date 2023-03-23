import Notifications from '@automattic/notifications/src/panel/Notifications';
import { sendMessage } from '@automattic/notifications/src/standalone/messaging';
import { createElement } from 'react';
import wpcom from 'calypso/lib/wp';
import './style.scss';

const localePattern = /[&?]locale=([\w_-]+)/;
const match = localePattern.exec( document.location.search );
const locale = match ? match[ 1 ] : 'en';
const isShowing = true;
const isVisible = true;

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
	ANSWER_PROMPT: [
		( st, { siteId, href } ) => {
			sendMessage( { action: 'answerPrompt', siteId, href } );
			window.open( href, '_blank' );
		},
	],
};

export default function () {
	const noteList = createElement( Notifications, {
		customEnhancer,
		customMiddleware,
		isShowing,
		isVisible,
		locale,
		receiveMessage: sendMessage,
		redirectPath: '/',
		wpcom,
	} );

	return (
		<div id="wpnc-panel" class="wide wpnc__main wpnt-open">
			{ noteList }
		</div>
	);
}
