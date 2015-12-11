/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import MasterbarItem from './masterbar-item';
import MasterbarItemNew from './masterbar-item-new';

import Gravatar from 'components/gravatar';
import layoutFocus from 'lib/layout-focus';
import config from 'config';
import paths from 'lib/paths';

import MasterbarLoggedOutMenu from './masterbar-logged-out-menu';
import MasterbarSectionsMenu from './masterbar-sections-menu';
import Notifications from 'notifications';
import store from 'store';

export default React.createClass( {
	displayName: 'Masterbar',

	propTypes: {
		user: React.PropTypes.object,
		section: React.PropTypes.string,
		sites: React.PropTypes.object,
	},

	getInitialState() {
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

	clickMySites() {
		layoutFocus.setNext( 'sidebar' );
	},

	clickReader() {
		layoutFocus.setNext( 'content' );
	},

	checkIsActive( section ) {
		return !! ( section === this.props.section && ! this.props.showNotes );
	},

	getNewPostPath() {
		var currentSite = this.props.sites.getSelectedSite() || this.props.user.get().primarySiteSlug;
		return paths.newPost( currentSite );
	},

	getNotificationLinkDomNode() {
		return this.refs.masterbar.refs.notificationLink;
	},

	toggleNotesFrame( event ) {
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

	checkToggleNotes( event, forceToggle ) {
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
	setNotesIndicator( currentUnseenCount ) {
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

	wordpressIcon() {
		// WP icon replacement for "horizon" environment
		if ( config( 'hostname' ) === 'horizon.wordpress.com' ) {
			return 'my-sites-horizon';
		}

		return 'my-sites';
	},

	renderMenu() {
		if ( this.props.user ) {
			return (
				<MasterbarSectionsMenu
					ref="masterbar"
					user={ this.props.user }
					section={ this.props.section }
					sites={ this.props.sites }
					toggleNotesFrame={ this.toggleNotesFrame }
					showNotes={ this.state.showNotes }
					newNote={ this.state.newNote }
					animationState={ this.state.animationState }
				/>
			);
		}

		return <MasterbarLoggedOutMenu />;
	},

	renderNotifications() {
		if ( this.props.user ) {
			return <Notifications visible={ this.state.showNotes } checkToggle={ this.checkToggleNotes } setIndicator={ this.setNotesIndicator } />;
		}
	},

	render() {
		var masterbarClass,
			masterbarClassObject = {
				masterbar: true
			};

		if ( this.props.user ) {
			masterbarClassObject.collapsible = true;
		}

		masterbarClass = classNames( masterbarClassObject );

		if ( this.props.user ) { // Logged in
			return (
				<header id="header" className={ masterbarClass }>
					<MasterbarItem url="/stats" icon={ this.wordpressIcon() } onClick={ this.clickMySites } isActive={ this.checkIsActive( 'sites' ) }>
						{ this.props.user.get().visible_site_count > 1
							? this.translate( 'My Sites', { comment: 'Toolbar, must be shorter than ~12 chars' } )
							: this.translate( 'My Site', { comment: 'Toolbar, must be shorter than ~12 chars' } )
						}
					</MasterbarItem>
					<MasterbarItem url="/" icon="reader" onClick={ this.clickReader } isActive={ this.checkIsActive( 'reader' ) }>
						{ this.translate( 'Reader', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }
					</MasterbarItem>

					<MasterbarItemNew sites={ this.props.sites } user={ this.props.user } isActive={ this.checkIsActive( 'post' ) } className="masterbar__item-new">
						{ this.translate( 'New Post' ) }
					</MasterbarItemNew>
					<MasterbarItem url="/me" icon="user-circle" isActive={ this.checkIsActive( 'me' ) } className="masterbar__item-me">
						<Gravatar user={ this.props.user.get() } alt="Me" size={ 18 } />
						<span className="masterbar__item-me-label">{ this.translate( 'Me', { context: 'Toolbar, must be shorter than ~12 chars' } ) }</span>
					</MasterbarItem>
					<MasterbarItem url="/notifications" icon="bell" isActive={ this.checkIsActive( 'notifications' ) } className="masterbar__item-notifications">
						{ this.translate( 'Notifications', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }
					</MasterbarItem>

					{ this.renderNotifications() }
				</header>
			);

		} else { // Logged out
			return (
				<header id="header" className={ masterbarClass }>
					<MasterbarItem url="/" icon="my-sites" className="masterbar__item-logo">
						WordPress<span className="tld">.com</span>
					</MasterbarItem>
				</header>
			);
		}
	}
} );
