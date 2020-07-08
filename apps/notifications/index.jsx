/**
 * Loads the notifications client into Calypso and
 * connects the messaging and interactive elements
 *
 *  - messages through iframe
 *  - keyboard hotkeys
 *  - window/pane scrolling
 *  - service worker
 *
 *
 * @module notifications
 */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import page from 'page';
import wpcom from 'lib/wp';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'lib/analytics/tracks';
import config from 'config';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';
import NotificationsPanel, { refreshNotes } from './src/panel/Notifications';
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';
import getCurrentLocaleVariant from 'state/selectors/get-current-locale-variant';
import { setUnseenCount } from 'state/notifications';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Returns whether or not the browser session
 * is currently visible to the user
 *
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

export class Notifications extends Component {
	state = {
		isVisible: getIsVisible(),
	};

	componentDidMount() {
		window.addEventListener( 'mousedown', this.props.checkToggle );
		window.addEventListener( 'touchstart', this.props.checkToggle );
		window.addEventListener( 'keydown', this.handleKeyPress );

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

	componentWillUnmount() {
		window.removeEventListener( 'mousedown', this.props.checkToggle );
		window.removeEventListener( 'touchstart', this.props.checkToggle );
		window.removeEventListener( 'keydown', this.handleKeyPress );

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

	handleVisibilityChange = () => this.setState( { isVisible: getIsVisible() } );

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
				// checktoggle closes panel with no parameters
				this.props.checkToggle();
				// ... and toggles when the 2nd parameter is true
				this.props.checkToggle( null, true );
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

		const customMiddleware = {
			APP_RENDER_NOTES: [
				( store, { newNoteCount } ) => {
					this.props.setIndicator( newNoteCount );
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
					page( `/read/blogs/${ siteId }/posts/${ postId }` );
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
					page( `/read/blogs/${ siteId }/posts/${ postId }#comment-${ commentId }` );
				},
			],
			OPEN_SITE: [
				( store, { siteId } ) => {
					this.props.checkToggle();
					this.props.recordTracksEventAction( 'calypso_notifications_open_site', {
						site_id: siteId,
					} );
					page( `/read/blogs/${ siteId }` );
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
		};

		return (
			<div
				id="wpnc-panel"
				className={ classNames( 'wide', 'wpnc__main', {
					'wpnt-open': this.props.isShowing,
					'wpnt-closed': ! this.props.isShowing,
				} ) }
			>
				<NotificationsPanel
					customMiddleware={ customMiddleware }
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
	} ),
	{
		recordTracksEventAction,
		setUnseenCount,
	}
)( Notifications );
