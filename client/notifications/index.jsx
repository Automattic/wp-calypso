/**
 * Loads the notifications client into Calypso and
 * connects the messaging and interactive elements
 *
 *  - messages through iframe
 *  - keyboard hotkeys
 *  - window/pane scrolling
 *  - service worker
 * @module notifications
 */

import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import NotificationsPanel, {
	refreshNotes,
} from '@automattic/notifications/src/panel/Notifications';
import clsx from 'clsx';
import debugFactory from 'debug';
import { Component } from 'react';
import { connect } from 'react-redux';
import localStorageHelper from 'store';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import { requestAdminMenu as requestAdminMenuAction } from 'calypso/state/admin-menu/actions';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import { setUnseenCount } from 'calypso/state/notifications/actions';
import { didForceRefresh } from 'calypso/state/notifications-panel/actions';
import { shouldForceRefresh } from 'calypso/state/notifications-panel/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentLocaleVariant from 'calypso/state/selectors/get-current-locale-variant';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

import './style.scss';

/**
 * Returns whether or not the browser session
 * is currently visible to the user
 * @returns {boolean} is the browser session visible
 */
const getIsVisible = () => {
	if ( ! document ) {
		return true;
	}

	if ( ! document.visibilityState ) {
		return true;
	}

	return document.visibilityState === 'visible';
};

const isDesktop = config.isEnabled( 'desktop' );

const debug = debugFactory( 'notifications:panel' );

export class Notifications extends Component {
	state = {
		// Desktop: override isVisible to maintain active polling for native UI elements (e.g. notification badge)
		isVisible: isDesktop ? true : getIsVisible(),
	};

	focusedElementBeforeOpen = null;

	actionHandlers = {
		APP_RENDER_NOTES: [
			( store, { newNoteCount } ) => {
				localStorageHelper.set( 'wpnotes_unseen_count', newNoteCount );
				this.props.setUnseenCount( newNoteCount );
			},
		],
		OPEN_LINK: [
			( store, { href, tracksEvent } ) => {
				if ( tracksEvent ) {
					this.props.recordTracksEventAction( 'calypso_notifications_' + tracksEvent, {
						link: href,
					} );
				}
				window.open( href, '_blank' );
			},
		],
		OPEN_POST: [
			( store, { siteId, postId } ) => {
				this.props.checkToggle();
				this.props.recordTracksEventAction( 'calypso_notifications_open_post', {
					site_id: siteId,
					post_id: postId,
				} );
				page( `/reader/blogs/${ siteId }/posts/${ postId }` );
			},
		],
		OPEN_COMMENT: [
			( store, { siteId, postId, commentId } ) => {
				this.props.checkToggle();
				this.props.recordTracksEventAction( 'calypso_notifications_open_comment', {
					site_id: siteId,
					post_id: postId,
					comment_id: commentId,
				} );
				page( `/reader/blogs/${ siteId }/posts/${ postId }#comment-${ commentId }` );
			},
		],
		OPEN_SITE: [
			( store, { siteId } ) => {
				this.props.checkToggle();
				this.props.recordTracksEventAction( 'calypso_notifications_open_site', {
					site_id: siteId,
				} );
				page( `/reader/blogs/${ siteId }` );
			},
		],
		VIEW_SETTINGS: [
			() => {
				this.props.checkToggle();
				page( '/me/notifications' );
			},
		],
		EDIT_COMMENT: [
			( store, { siteId, postId, commentId } ) => {
				this.props.checkToggle();
				this.props.recordTracksEventAction( 'calypso_notifications_edit_comment', {
					site_id: siteId,
					post_id: postId,
					comment_id: commentId,
				} );
				page( `/comment/${ siteId }/${ commentId }?action=edit` );
			},
		],
		ANSWER_PROMPT: [
			( store, { siteId, href } ) => {
				this.props.checkToggle();
				this.props.recordTracksEventAction( 'calypso_notifications_answer_prompt', {
					site_id: siteId,
				} );
				window.open( href, '_blank' );
			},
		],
		CLOSE_PANEL: [
			() => {
				this.props.checkToggle();
			},
		],
		APPROVE_NOTE: [
			() => {
				this.props.requestAdminMenu( this.props.selectedSiteId );
			},
		],
		NOTES_REMOVE: [
			( _, { isComment } ) => {
				if ( isComment ) {
					this.props.requestAdminMenu( this.props.selectedSiteId );
				}
			},
		],
	};

	componentDidMount() {
		document.addEventListener( 'click', this.props.checkToggle );
		document.addEventListener( 'keydown', this.handleKeyPress );

		if ( this.props.isShowing ) {
			this.focusedElementBeforeOpen = document.activeElement;
		}

		if ( typeof document.hidden !== 'undefined' ) {
			document.addEventListener( 'visibilitychange', this.handleVisibilityChange );
		}

		if (
			'serviceWorker' in window.navigator &&
			'addEventListener' in window.navigator.serviceWorker
		) {
			window.navigator.serviceWorker.addEventListener(
				'message',
				this.receiveServiceWorkerMessage
			);
			this.postServiceWorkerMessage( { action: 'sendQueuedMessages' } );
		}
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.isShowing === this.props.isShowing ) {
			return;
		}

		if ( ! prevProps.isShowing && this.props.isShowing ) {
			this.focusedElementBeforeOpen = document.activeElement;
		} else {
			this.focusedElementBeforeOpen?.focus();
		}
	}

	componentWillUnmount() {
		document.removeEventListener( 'click', this.props.checkToggle );
		document.removeEventListener( 'keydown', this.handleKeyPress );

		if ( typeof document.hidden !== 'undefined' ) {
			document.removeEventListener( 'visibilitychange', this.handleVisibilityChange );
		}

		if (
			'serviceWorker' in window.navigator &&
			'removeEventListener' in window.navigator.serviceWorker
		) {
			window.navigator.serviceWorker.removeEventListener(
				'message',
				this.receiveServiceWorkerMessage
			);
		}

		window.removeEventListener( 'message', this.handleDesktopNotificationMarkAsRead );
	}

	handleKeyPress = ( event ) => {
		if ( event.target !== document.body && event.target.tagName !== 'A' ) {
			return;
		}
		if ( event.altKey || event.ctrlKey || event.metaKey ) {
			return;
		}

		// 'n' key should toggle the notifications frame
		if ( 78 === event.keyCode ) {
			event.stopPropagation();
			event.preventDefault();
			this.props.checkToggle( null, true );
		}

		if ( 27 === event.keyCode && this.props.isShowing ) {
			event.stopPropagation();
			event.preventDefault();
			this.props.checkToggle( null, true );
		}
	};

	// Desktop: override isVisible to maintain active polling for native UI elements (e.g. notification badge)
	handleVisibilityChange = () => this.setState( { isVisible: isDesktop ? true : getIsVisible() } );

	receiveServiceWorkerMessage = ( event ) => {
		// Receives messages from the service worker
		// Older Firefox versions (pre v48) set event.origin to "" for service worker messages
		// Firefox does not support document.origin; we can use location.origin instead
		if ( event.origin && event.origin !== window.location.origin ) {
			return;
		}

		if ( ! ( 'action' in event.data ) ) {
			return;
		}

		switch ( event.data.action ) {
			case 'openPanel':
				// Ensure panel is opened.
				this.props.checkToggle( null, true, true );
				return refreshNotes();

			case 'trackClick':
				recordTracksEvent( 'calypso_web_push_notification_clicked', {
					push_notification_note_id: event.data.notification.note_id,
					push_notification_type: event.data.notification.type,
				} );

				return;
		}
	};

	postServiceWorkerMessage = ( message ) => {
		if ( ! ( 'serviceWorker' in window.navigator ) ) {
			return;
		}

		window.navigator.serviceWorker.ready.then(
			( registration ) => 'active' in registration && registration.active.postMessage( message )
		);
	};

	render() {
		const localeSlug = this.props.currentLocaleSlug || config( 'i18n_default_locale_slug' );

		if ( this.props.forceRefresh ) {
			debug( 'Refreshing notes panel...' );
			refreshNotes();
			this.props.didForceRefresh();
		}

		return (
			<div
				id="wpnc-panel"
				className={ clsx( 'wide', 'wpnc__main', {
					'wpnt-open': this.props.isShowing,
					'wpnt-closed': ! this.props.isShowing,
				} ) }
			>
				<NotificationsPanel
					actionHandlers={ this.actionHandlers }
					isShowing={ this.props.isShowing }
					isVisible={ this.state.isVisible }
					locale={ localeSlug }
					wpcom={ wpcom }
				/>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		currentLocaleSlug: getCurrentLocaleVariant( state ) || getCurrentLocaleSlug( state ),
		forceRefresh: shouldForceRefresh( state ),
		selectedSiteId: getSelectedSiteId( state ),
	} ),
	( dispatch ) => ( {
		recordTracksEventAction: ( name, properties ) =>
			dispatch( recordTracksEventAction( name, properties ) ),
		setUnseenCount: ( count ) => dispatch( setUnseenCount( count ) ),
		didForceRefresh: () => dispatch( didForceRefresh() ),
		requestAdminMenu: ( siteId ) => dispatch( requestAdminMenuAction( siteId ) ),
	} )
)( Notifications );
