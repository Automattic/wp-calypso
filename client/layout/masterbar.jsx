/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var MasterbarLoggedOutMenu = require( './masterbar-logged-out-menu' ),
	MasterbarSectionsMenu = require( './masterbar-sections-menu' ),
	Notifications = require( 'notifications' ),
	store = require( 'store' );

module.exports = React.createClass( {

	displayName: 'Masterbar',

	defaultNoticon: '\uf800',

	getInitialState: function() {
		var newNote = false,
			user;

		if ( this.props.user ) {
			user = this.props.user.get();
		}

		// User object should be loaded by now, but
		// if it isn't just wait until the notifications
		// finish their initial load to set `newNote`
		if ( user && user.has_unseen_notes ) {
			newNote = true;
		}

		return {
			animationState: -1, // used to make the notification icon blink
			showNotes: false,   // whether we show the notifications panel
			newNote: newNote    // if we have a new unseen note
		};
	},

	getNotificationLinkDomNode: function() {
		return this.refs.masterbar.refs.notificationLink;
	},

	toggleNotesFrame: function( event ) {
		if ( event ) {
			event.preventDefault();
		}

		this.setState( {
			showNotes: ! this.state.showNotes
		}, function() {
			if ( this.state.showNotes ) {
				this.setNotesIndicator( 0 );
			}

			// focus on main window if we just closed the notes panel
			if ( ! this.state.showNotes ) {
				this.getNotificationLinkDomNode().blur();
				window.focus();
			}
		}.bind( this ) );
	},

	checkToggleNotes: function( event, forceToggle ) {
		var target = event ? event.target : false,
			notificationNode = this.getNotificationLinkDomNode();

		// Some clicks should not toggle the notifications frame
		if ( target === notificationNode || target.parentElement === notificationNode ) {
			return;
		}

		if ( this.state.showNotes || forceToggle === true ) {
			this.toggleNotesFrame();
		}
	},

	/**
	 * Uses the passed number of unseen notifications
	 * and the locally-stored cache of that value to
	 * determine what state the notifications indicator
	 * should be in: on, off, or animate-to-on
	 *
	 * @param {Number} currentUnseenCount Number of reported unseen notifications
	 */
	setNotesIndicator: function( currentUnseenCount ) {
		var existingUnseenCount = store.get( 'wpnotes_unseen_count' ),
			newAnimationState = this.state.animationState;

		// Having no record of previously unseen notes is
		// functionally equal to having a record of none
		if ( null === existingUnseenCount ) {
			existingUnseenCount = 0;
		}

		if ( 0 === currentUnseenCount ) {
			// If we don't have new notes at load-time, remove the `-1` "init" status
			newAnimationState = 0;
		} else if ( currentUnseenCount > existingUnseenCount ) {
			// Animate the indicator bubble by swapping CSS classes through the animation state
			// Note that we could have an animation state of `-1` indicating the initial load
			newAnimationState = ( 1 - Math.abs( this.state.animationState ) );
		}

		store.set( 'wpnotes_unseen_count', currentUnseenCount );

		this.setState( {
			newNote: ( currentUnseenCount > 0 ),
			animationState: newAnimationState
		} );
	},

	renderMenu: function() {
		if ( this.props.user ) {
			return <MasterbarSectionsMenu ref="masterbar" user={ this.props.user } section={ this.props.section } sites={ this.props.sites } toggleNotesFrame={ this.toggleNotesFrame } showNotes={ this.state.showNotes } newNote={ this.state.newNote } animationState={ this.state.animationState } />;
		}
		return <MasterbarLoggedOutMenu />;
	},

	renderNotifications: function() {
		if ( this.props.user ) {
			return <Notifications visible={ this.state.showNotes } checkToggle={ this.checkToggleNotes } setIndicator={ this.setNotesIndicator } />;
		}
	},

	render: function() {
		var masterbarClass,
			masterbarClassObject = {
				toolbar: true,
				masterbar: true,
				'slide-out-up': true,
				'wpcom-header': true
			};

		if ( this.props.user ) {
			masterbarClassObject.collapsible = true;
		}

		masterbarClass = classNames( masterbarClassObject );

		return (
			<header id="header" className={ masterbarClass }>
				<div className="wpcom-navigation site-navigation" role="navigation">
					{ this.renderMenu() }
				</div>
				{ this.renderNotifications() }
			</header>
		);
	}

} );
