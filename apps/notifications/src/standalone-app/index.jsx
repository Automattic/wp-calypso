import '@automattic/calypso-polyfills';
import { useViewportMatch } from '@wordpress/compose';
import { setLocaleData } from '@wordpress/i18n';
import debugFactory from 'debug';
import { setLocale } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import NotificationApp, { refreshNotes } from '../app';
import { SET_IS_SHOWING } from '../panel/state/action-types';
import actions from '../panel/state/actions';
import { createClient } from '../standalone/client';
import { receiveMessage, sendMessage } from '../standalone/messaging';

import './style.scss';

const debug = debugFactory( 'notifications:standalone-app' );

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

		const localeData = await response.json();
		// Sync @wordpress/i18n first — setLocale triggers re-renders that call __()
		setLocaleData( localeData );
		setLocale( localeData );
	} catch {}
};

// The notifications app (src/app) owns its Redux store internally and exposes
// no isShowing/isVisible props (it is built for popover hosts where mount means
// "open"). The standalone widget instead lives in a long-lived iframe whose
// host toggles it open/closed via postMessage, so we keep a reference to that
// store through a custom enhancer and drive the open/visibility state into it
// directly — the same effect the old panel component performed via props.
let store = { dispatch: () => {}, getState: () => {} };
const customEnhancer = ( next ) => ( reducer, initialState ) =>
	( store = next( reducer, initialState ) );

const ACTION_HANDLERS = {
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
	// Note: the host widescreen resize is driven from the detail pane's
	// `.is-open` class via a MutationObserver in NotesWrapper, not from the
	// panel's SELECT_NOTE → SET_LAYOUT chain. The app dispatches SELECT_NOTE on
	// open but never on close (it closes via React state), so SET_LAYOUT only
	// ever fires 'widescreen' and never 'narrow' — observing the class lets us
	// resize the iframe both ways and stays in sync with the side-by-side CSS.
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
	const isMobileViewport = useViewportMatch( 'small', '<' );

	if ( locale && 'en' !== locale ) {
		fetchLocale( locale );
	}

	debug( 'wrapper state update', { isShowing, isVisible } );

	// Mirror the host-driven open/visibility state into the app's store. The
	// APP_REFRESH_NOTES handler (registered by the app) reads the panel-open
	// flag back out of the store and forwards both values to the REST client,
	// so SET_IS_SHOWING must be dispatched first.
	useEffect( () => {
		store.dispatch( { type: SET_IS_SHOWING, isShowing } );
		if ( ! isShowing ) {
			// Unselect the note so key handlers don't steal keystrokes while hidden.
			store.dispatch( actions.ui.unselectNote() );
		}
		store.dispatch( { type: 'APP_REFRESH_NOTES', isVisible } );
	}, [ isShowing, isVisible ] );

	useEffect( () => {
		const handleMessages = ( { action, hidden, showing } ) => {
			debug( 'message received', { action, hidden, showing } );

			if ( 'togglePanel' === action ) {
				setIsShowing( !! showing );
			}

			if ( 'toggleVisibility' === action ) {
				setIsVisible( ! hidden );
			}

			if ( 'refreshNotes' === action ) {
				refreshNotes();
			}

			if ( 'closeShortcutsPopover' === action ) {
				store.dispatch( actions.ui.closeShortcutsPopover() );
			}

			if ( 'toggleShortcutsPopover' === action ) {
				store.dispatch( actions.ui.toggleShortcutsPopover() );
			}
		};

		const handleVisibilityChange = () => setIsVisible( document.visibilityState === 'visible' );

		document.addEventListener( 'visibilitychange', handleVisibilityChange );
		window.addEventListener( 'message', receiveMessage( handleMessages ) );

		// Let the host know the iframe has booted and is ready to be toggled.
		// The app dispatches APP_IS_READY into a transient store created before
		// our custom enhancer takes over, so we signal readiness directly here.
		sendMessage( { action: 'iFrameReady' } );

		sendMessage( { action: 'widescreen', widescreen: true } );
	}, [] );

	return (
		<NotificationApp
			customEnhancer={ customEnhancer }
			actionHandlers={ ACTION_HANDLERS }
			locale={ locale }
			wpcom={ wpcom }
			isDismissible={ isMobileViewport }
		/>
	);
};

// The src/app components consume the wp-admin theme variables (directly and via
// DataViews). WP-admin provides them globally, but this standalone iframe is the
// host, so we must supply them — matching client/dashboard/app-dotcom (default
// blue admin color). They're set on the document root via JS rather than in CSS
// because this app's postcss runs `postcss-custom-properties` with
// `preserve: false`, which strips `:root` custom-property declarations from the
// built stylesheet. Setting them on `documentElement` keeps them on `:root`, so
// they also cascade to popovers/dropdowns that portal to the iframe body.
const WP_ADMIN_THEME_VARS = {
	'--wp-admin-theme-color': '#3858e9',
	'--wp-admin-theme-color--rgb': '56, 88, 233',
	'--wp-admin-theme-color-darker-10': '#2145e6',
	'--wp-admin-theme-color-darker-10--rgb': '33, 69, 230',
	'--wp-admin-theme-color-darker-20': '#183ad6',
	'--wp-admin-theme-color-darker-20--rgb': '24, 58, 214',
	'--wp-admin-border-width-focus': '2px',
};

const applyAdminThemeVars = () => {
	const { style } = document.documentElement;
	Object.entries( WP_ADMIN_THEME_VARS ).forEach( ( [ name, value ] ) =>
		style.setProperty( name, value )
	);
};

const render = ( wpcom ) => {
	document.body.classList.add( 'font-smoothing-antialiased' );
	applyAdminThemeVars();

	const root = createRoot( document.getElementsByClassName( 'wpnc__main' )[ 0 ] );
	root.render( <NotesWrapper wpcom={ wpcom } /> );
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
