/**
 * External dependencies
 */
var React = require( 'react' ),
	config = require( 'config' ),
	debug = require( 'debug' )( 'calypso:notifications' ),
	assign = require( 'lodash/assign' ),
	oAuthToken = require( 'lib/oauth-token' );

/**
 * Internal dependencies
 */
var analytics = require( 'lib/analytics' ),
	config = require( 'config' ),
	user = require( 'lib/user' )();

/**
 * Module variables
 */
var widgetDomain = 'https://widgets.wp.com';

var Notifications = React.createClass({
	getInitialState: function() {
		return {
			'loaded' : true,
			'iframeLoaded' : false,
			'shownOnce' : false,
			'widescreen' : false
		};
	},

	preventDefault: function( event ) {
		event.preventDefault();
	},

	enableMainWindowScroll: function() {
		document.body.removeEventListener( 'mousewheel', this.preventDefault, false );
	},

	disableMainWindowScroll: function() {
		document.body.addEventListener( 'mousewheel', this.preventDefault, false );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.visible && !this.state.loaded ) {
			this.setState( { 'loaded' : true } );
		} else if ( !nextProps.visible && !this.state.iframeLoaded && this.state.shownOnce ) {
			// for cases where iframe is stuck loading, this will remove it from
			// the DOM so we can try reloading it next time
			this.setState( { 'loaded' : false } );
		}

		// tell the iframe if we're changing visible status
		if ( nextProps.visible !== this.props.visible ) {
			this.postMessage( { 'action': 'togglePanel', 'showing': nextProps.visible } );
			this.setState( { 'shownOnce' : true, 'widescreen': false } );
		}

		if ( document.documentElement.classList.contains( 'touch' ) ) {
			// prevent scrolling on main page on mobile
			if ( this.props.visible && ! nextProps.visible ) {
				document.body.removeEventListener( 'touchmove', this.preventDefault, false );
			} else if ( ! this.props.visible && nextProps.visible ) {
				document.body.addEventListener( 'touchmove', this.preventDefault, false );
			}
		}
	},

	componentDidUpdate: function( prevProps ) {
		var frameNode;
		if ( this.props.visible && ! prevProps.visible ) {
			// showing the panel, focus so we can use shortcuts
			frameNode = this.refs.widgetFrame;
			if ( frameNode ) {
				frameNode.contentWindow.focus();
			}
		}
	},

	componentDidMount: function() {
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
	},

	componentWillUnmount: function() {
		window.removeEventListener( 'message', this.receiveMessage );
		window.removeEventListener( 'mousedown', this.props.checkToggle );
		window.removeEventListener( 'touchstart', this.props.checkToggle );
		window.removeEventListener( 'keydown', this.handleKeyPress );
		document.body.removeEventListener( 'mousewheel', this.preventDefault, false );
		document.body.removeEventListener( 'touchmove', this.preventDefault, false );

		if ( typeof document.hidden !== 'undefined' ) {
			document.removeEventListener( 'visibilitychange', this.handleVisibilityChange );
		}

		if ( 'serviceWorker' in window.navigator && 'removeEventListener' in window.navigator.serviceWorker ) {
			window.navigator.serviceWorker.removeEventListener( 'message', this.receiveServiceWorkerMessage );
		}
	},

	handleKeyPress: function( event ) {
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
	},

	handleVisibilityChange: function() {
		this.postMessage( {
			'action' : 'toggleVisibility',
			'hidden' : document.hidden ? true : false
		} );
	},

	postAuth: function() {
		if ( config.isEnabled( 'oauth' ) ) {
			const token = oAuthToken.getToken();

			if ( token !== false ) {
				this.postMessage( {
					action: 'setAuthToken',
					token: token
				} );
			}
		}
	},

	receiveMessage: function(event) {
		// Receives messages from the notifications widget
		if ( event.origin !== widgetDomain ) {
			return;
		}

		var data = event.data;
		if ( typeof data === 'string' ) {
			data = JSON.parse( data );
		}

		if ( data.type !== 'notesIframeMessage' ) {
			return;
		}

		if ( data.action === 'togglePanel' ) {
			this.props.checkToggle();
		} else if ( data.action === 'render' ) {
			this.props.setIndicator( data.num_new );

		} else if ( data.action === 'iFrameReady' ) {
			// the iframe is loaded, send any pending messages
			this.setState( { 'iframeLoaded' : true } );
			debug( 'notifications iframe loaded' );

			// We always want this to happen, in addition to whatever may be queued
			this.postAuth();

			if ( this.queuedMessage ) {
				this.postMessage( this.queuedMessage );
				this.queuedMessage = null;
			}

		} else if ( data.action === 'renderAllSeen' ) {
			// user has seen the notes, no longer new
			this.props.setIndicator( 0 );
		} else if ( data.action === 'widescreen') {
			this.setState( { widescreen: data.widescreen } );
		} else {
			debug( 'unknown message from iframe: %s', event.data );
		}
	},

	receiveServiceWorkerMessage: function( event ) {
		// Receives messages from the service worker
		// Firefox sets event.origin to "" for service worker messages
		if ( event.origin && event.origin !== document.origin ) {
			return;
		}

		if ( !( 'action' in event.data ) ) {
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
				break;
			case 'trackClick':
				analytics.tracks.recordEvent( 'calypso_web_push_notification_clicked', {
					push_notification_note_id: event.data.notification.note_id,
					push_notification_type: event.data.notification.type
				} );
				break;
		}
	},

	postMessage: function( message ) {
		var iframeMessage = { 'type': 'notesIframeMessage' };
		iframeMessage = assign( {}, iframeMessage, message );

		if ( this.refs.widgetFrame && this.state.iframeLoaded ) {
			var widgetWindow = this.refs.widgetFrame.contentWindow;
			widgetWindow.postMessage( JSON.stringify( iframeMessage ), widgetDomain );
		} else {
			// save only the latest message to send when iframe is loaded
			this.queuedMessage = message;
		}
	},

	postServiceWorkerMessage: function( message ) {
		if ( 'serviceWorker' in window.navigator ) {
			window.navigator.serviceWorker.ready.then( ( serviceWorkerRegistration ) => {
				if ( 'active' in serviceWorkerRegistration ) {
					serviceWorkerRegistration.active.postMessage( message );
				}
			} );
		}
	},

	render: function() {
		var userData = user.get(),
			localeSlug = userData.localeSlug || config( 'i18n_default_locale_slug' ),
			widgetURL = widgetDomain,
			divStyle = {},
			frameClasses = [ 'wide' ],
			panelClasses = [ 'wide' ],
			now = new Date();

		if ( config.isEnabled( 'notifications2beta' ) ) {
			widgetURL = widgetURL + '/notificationsbeta/';
		} else {
			widgetURL = widgetURL + '/notifications/';
		}
		if ( user.isRTL() ) {
			widgetURL += 'rtl.html';
		}
		widgetURL += '?locale=' + localeSlug;

		// cache buster
		widgetURL += '&' + now.getFullYear() + ( now.getMonth() + 1 ) + now.getDate() + ( now.getHours() + 10 );

		if ( this.state.widescreen && this.props.visible ) {
			frameClasses.push( 'widescreen' );
		}

		if ( this.props.visible ) {
			panelClasses.push( 'wpnt-open' );
		} else {
			panelClasses.push( 'wpnt-closed' );
		}

		if ( ! this.props.visible && ! this.state.loaded ) {
			return <div />;
		}

		return (
			<div id="wpnt-notes-panel2" className={ panelClasses.join( ' ' ) } onMouseEnter={ this.disableMainWindowScroll } onMouseLeave={ this.enableMainWindowScroll }>
				<iframe ref="widgetFrame" id="wpnt-notes-iframe2" className={ frameClasses.join( ' ' ) } src={ widgetURL } frameBorder="0" allowTransparency="true"></iframe>
			</div>
		);
	}
});

module.exports = Notifications;
