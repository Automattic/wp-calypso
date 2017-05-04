/**
 * Loads the notifications client into Calypso and
 * connects the messaging and interactive elements
 *
 *  - messages through iframe
 *  - keyboard hotkeys
 *  - window/pane scrolling
 *  - service worker
 *
 * @module notifications
 */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import debugFactory from 'debug';
import wpcom from 'lib/wp';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import config from 'config';
import userLib from 'lib/user';
import store from 'store';
import {
	getNotificationsAnimationState,
	hasCurrentUserUnseenNotifications,
	isNotificationsPanelOpen,
} from 'state/selectors';
import {
	setNotificationsIndicator,
	toggleNotificationsPanel
} from 'state/ui/notifications/actions';

import NotificationsPanel from './notifications-panel/src/Notifications';

/**
 * Module variables
 */
const debug = debugFactory( 'notifications:wrapper' );
const user = userLib();
const widgetDomain = 'https://widgets.wp.com';

/**
 * Attempts to parse a JSON string
 *
 * @param {String} input possibly JSON data
 * @returns {*} parsed data on success and `null` on failure
 */
const parseJson = input => {
	try {
		return JSON.parse( input );
	} catch ( e ) {
		return null;
	}
};

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
		shownOnce: false,
		widescreen: false,
	};

	componentWillReceiveProps( nextProps ) {
		// tell the iframe if we're changing visible status
		if ( nextProps.notificationsPanelIsOpen !== this.props.notificationsPanelIsOpen ) {
			this.setState( { shownOnce: true, widescreen: false } );
		}
	}

	// componentWillReceiveProps( nextProps ) {
	// 	this.user = this.props.user.get();
	//
	// 	let newNote = this.user && this.user.has_unseen_notes;
	// 	// // this.setState( {
	// 	// // 	newNote: this.user && this.user.has_unseen_notes,
	// 	// // } );
	//
	// 	if ( ! this.props.notificationsPanelIsOpen && nextProps.notificationsPanelIsOpen ) {
	// 		this.props.recordOpening( store.get( 'wpnotes_unseen_count' ) );
	// 		newNote = 0;
	// 	}
	//
	// 	this.setNotesIndicator( 0 );
	// 	// this.props.setNotificationsIndicator( 0, newNote );
	//
	// 	// focus on main window if we just closed the notes panel
	// 	if ( this.props.notificationsPanelIsOpen && ! nextProps.notificationsPanelIsOpen ) {
	// 		// this.getNotificationLinkDomNode().blur();
	// 		window.focus();
	// 	}
	// }

	componentDidMount() {
		window.addEventListener( 'message', this.receiveMessage );
		window.addEventListener( 'mousedown', this.checkToggleNotes );
		window.addEventListener( 'touchstart', this.checkToggleNotes );
		window.addEventListener( 'keydown', this.handleKeyPress );

		if ( typeof document.hidden !== 'undefined' ) {
			document.addEventListener( 'visibilitychange', this.handleVisibilityChange );
		}

		if ( 'serviceWorker' in window.navigator && 'addEventListener' in window.navigator.serviceWorker ) {
			window.navigator.serviceWorker.addEventListener( 'message', this.receiveServiceWorkerMessage );
			this.postServiceWorkerMessage( { action: 'sendQueuedMessages' } );
		}
	}

	componentWillUnmount() {
		window.removeEventListener( 'message', this.receiveMessage );
		window.removeEventListener( 'mousedown', this.checkToggleNotes );
		window.removeEventListener( 'touchstart', this.checkToggleNotes );
		window.removeEventListener( 'keydown', this.handleKeyPress );

		if ( typeof document.hidden !== 'undefined' ) {
			document.removeEventListener( 'visibilitychange', this.handleVisibilityChange );
		}

		if ( 'serviceWorker' in window.navigator && 'removeEventListener' in window.navigator.serviceWorker ) {
			window.navigator.serviceWorker.removeEventListener( 'message', this.receiveServiceWorkerMessage );
		}
	}

	handleKeyPress = event => {
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
			this.checkToggleNotes( null, true );
		}
	};

	handleVisibilityChange = () => this.setState( { isVisible: getIsVisible() } );

	/**
	 * Uses the passed number of unseen notifications
	 * and the locally-stored cache of that value to
	 * determine what state the notifications indicator
	 * should be in: on, off, or animate-to-on
	 *
	 * @param {Number} currentUnseenCount Number of reported unseen notifications
	 */
	setNotesIndicator = ( { unseen } ) => {
		const existingUnseenCount = store.get( 'wpnotes_unseen_count' );
		let newAnimationState = this.props.animationState;

		if ( 0 === unseen ) {
			// If we don't have new notes at load-time, remove the `-1` "init" status
			newAnimationState = 0;
		} else if ( unseen > existingUnseenCount ) {
			// Animate the indicator bubble by swapping CSS classes through the animation state
			// Note that we could have an animation state of `-1` indicating the initial load
			newAnimationState = ( 1 - Math.abs( this.props.animationState ) );
		}

		store.set( 'wpnotes_unseen_count', unseen );

		this.props.setNotificationsIndicator( newAnimationState, unseen > 0 );
	};

	receiveMessage = event => {
		// Receives messages from the notifications widget
		if ( event.origin !== widgetDomain ) {
			return;
		}

		const data = 'string' === typeof event.data
			? parseJson( event.data )
			: event.data;

		// silently ignore messages which don't belong here
		// they probably are bound for another event handler
		if ( ! data || data.type !== 'notesIframeMessage' ) {
			return;
		}

		switch ( data.action ) {
			case 'widescreen':
				return this.setState( { widescreen: data.widescreen } );
		}

		throw new TypeError(
			'Cannot handles message received from notifications client\n' +
			`Action type unknown: ${ data.action }\n` +
			`Received message: ${ data }`
		);
	};

	receiveServiceWorkerMessage = event => {
		// Receives messages from the service worker
		// Older Firefox versions (pre v48) set event.origin to "" for service worker messages
		// Firefox does not support document.origin; we can use location.origin instead
		if ( event.origin && event.origin !== location.origin ) {
			return;
		}

		if ( ! ( 'action' in event.data ) ) {
			return;
		}

		switch ( event.data.action ) {
			case 'openPanel':
				// checktoggle closes panel with no parameters
				this.checkToggleNotes();
				// ... and toggles when the 2nd parameter is true
				this.checkToggleNotes( null, true );
				// force refresh the panel
				this.postMessage( { action: 'refreshNotes' } );

				return;

			case 'trackClick':
				analytics.tracks.recordEvent( 'calypso_web_push_notification_clicked', {
					push_notification_note_id: event.data.notification.note_id,
					push_notification_type: event.data.notification.type
				} );

				return;
		}
	};

	/**
	 * Sends a message to the notifications client
	 *
	 * @param {!Object} message data to send
	 * @param {!String} message.action name of action for notes app to dispatch
	 */
	postMessage = message => {
		const data = JSON.stringify( {
			...message,
			type: 'notesIframeMessage',
		} );

		debug( data );
	};

	postServiceWorkerMessage = message => {
		if ( ! ( 'serviceWorker' in window.navigator ) ) {
			return;
		}

		window.navigator.serviceWorker.ready.then(
			registration => ( 'active' in registration ) && registration.active.postMessage( message )
		);
	};

	checkToggleNotes = ( event, forceToggle ) => {
		const target = event ? event.target : false;
		const notificationLinkNode = this.props.getNotificationsLink();

		if ( target && ( notificationLinkNode.contains( target ) || this.notificationsPanelNode.contains( target ) ) ) {
			return;
		}

		if ( this.props.notificationsPanelIsOpen || forceToggle === true ) {
			this.toggleNotesFrame( event );
		}
	};

	toggleNotesFrame = ( event ) => {
		if ( event ) {
			event.preventDefault && event.preventDefault();
			event.stopPropagation && event.stopPropagation();
		}

		this.props.toggleNotificationsPanel();
	};

	getNotificationsNode = node => this.notificationsPanelNode = node;

	render() {
		const localeSlug = get( user.get(), 'localeSlug', config( 'i18n_default_locale_slug' ) );

		return (
			<div
				ref={ this.getNotificationsNode }
				id="wpnc-panel"
				className={ classNames( 'wide', 'wpnc__main', {
					'wpnt-open': this.props.notificationsPanelIsOpen,
					'wpnt-closed': ! this.props.notificationsPanelIsOpen,
				} ) }
			>
				<NotificationsPanel
					isShowing={ this.props.notificationsPanelIsOpen }
					isVisible={ this.state.isVisible }
					locale={ localeSlug }
					onRender={ this.setNotesIndicator }
					wpcom={ wpcom }
				/>
			</div>
		);
	}
}

export default connect(
	state => ( {
		hasUnseenNotifications: hasCurrentUserUnseenNotifications( state ),
		notificationsPanelIsOpen: isNotificationsPanelOpen( state ),
		animationState: getNotificationsAnimationState( state ),
	} ),
	{
		setNotificationsIndicator,
		toggleNotificationsPanel
	}
)( Notifications );
