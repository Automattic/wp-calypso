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
import classNames from 'classnames';
import wpcom from 'lib/wp';
import { get, invoke } from 'lodash';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import config from 'config';
import userLib from 'lib/user';

import NotificationsPanel from './notifications-panel/src/Notifications';

/**
 * Module variables
 */
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

export class Notifications extends Component {
	state = {
		loaded: true,
		iframeLoaded: false,
		shownOnce: false,
		widescreen: false,
	};

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.visible && ! this.state.loaded ) {
			this.setState( { loaded: true } );
		} else if ( ! nextProps.visible && ! this.state.iframeLoaded && this.state.shownOnce ) {
			// for cases where iframe is stuck loading, this will remove it from
			// the DOM so we can try reloading it next time
			this.setState( { loaded: false } );
		}

		// tell the iframe if we're changing visible status
		if ( nextProps.visible !== this.props.visible ) {
			this.postMessage( { action: 'togglePanel', showing: nextProps.visible } );
			this.setState( { shownOnce: true, widescreen: false } );
		}
	}

	componentDidUpdate( { visible } ) {
		// focus notes frame when it opens to
		// enable notes keyboard shortcuts
		if ( visible && ! this.props.visible ) {
			invoke( this, 'notesFrame.contentWindow.focus' );
		}
	}

	componentDidMount() {
		window.addEventListener( 'message', this.receiveMessage );
		window.addEventListener( 'mousedown', this.props.checkToggle );
		window.addEventListener( 'touchstart', this.props.checkToggle );
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
		window.removeEventListener( 'mousedown', this.props.checkToggle );
		window.removeEventListener( 'touchstart', this.props.checkToggle );
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
			this.props.checkToggle( null, true );
		}
	};

	handleVisibilityChange = () => this.postMessage( {
		action: 'toggleVisibility',
		hidden: !! document.hidden,
	} );

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
			case 'iFrameReady':
				if ( ! this.state.iframeLoaded ) {
					this.setState( { iframeLoaded: true } );
				}

				if ( this.queuedMessage ) {
					this.postMessage( this.queuedMessage );
					this.queuedMessage = null;
				}

				return;

			case 'render':
				return this.props.setIndicator( data.num_new );

			case 'renderAllSeen':
				return this.props.setIndicator( 0 );

			case 'togglePanel':
				return this.props.checkToggle();

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
				this.props.checkToggle();
				// ... and toggles when the 2nd parameter is true
				this.props.checkToggle( null, true );
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
	 * @returns {*} please ignore return value
	 */
	postMessage = message => {
		// save only the latest message to send when iframe is loaded
		if ( ! ( this.notesFrame && this.state.iframeLoaded ) ) {
			return this.queuedMessage = message;
		}

		const data = JSON.stringify( {
			...message,
			type: 'notesIframeMessage',
		} );

		this.notesFrame.contentWindow.postMessage( data, widgetDomain );
	};

	postServiceWorkerMessage = message => {
		if ( ! ( 'serviceWorker' in window.navigator ) ) {
			return;
		}

		window.navigator.serviceWorker.ready.then(
			registration => ( 'active' in registration ) && registration.active.postMessage( message )
		);
	};

	render() {
		if ( ! this.props.visible && ! this.state.loaded ) {
			// @TODO we need a good loading message
			return <div />;
		}

		const localeSlug = get( user.get(), 'localeSlug', config( 'i18n_default_locale_slug' ) );

		return (
			<div
				id="wpnc-panel"
				className={ classNames( 'wide', 'wpnc__main', {
					'wpnt-open': this.props.visible,
					'wpnt-closed': ! this.props.visible,
				} ) }
			>
				<NotificationsPanel
					isVisible={ this.props.visible }
					locale={ localeSlug }
					wpcom={ wpcom }
				/>
			</div>
		);
	}
}

export default Notifications;
