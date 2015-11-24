/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import config from 'config';
import MasterbarNewPost from 'layout/masterbar-new-post';
import layoutFocus from 'lib/layout-focus';
import SiteStatsStickyLink from 'components/site-stats-sticky-link';
import Gravatar from 'components/gravatar';

export default React.createClass( {
	displayName: 'MasterbarSectionsMenu',

	defaultNoticon: '\uf800',

	itemLinkClass( section, classes ) {
		classes = classes || {};

		classes.active = ( section === this.props.section && ! this.props.showNotes );

		return classNames( classes );
	},

	focusSidebar() {
		layoutFocus.setNext( 'sidebar' );
	},

	focusContent() {
		layoutFocus.setNext( 'content' );
	},

	renderNotificationsLink() {
		var linkTitle = this.translate( 'Manage your notifications', {
				textOnly: true
			} ),
			notificationIcon,
			toolbarTitle = this.translate( 'Notifications', {
				comment: 'Toolbar, must be shorter than ~12 chars'
			} );

		// In order to reset the animation we have to force React to recreate the DOM element.
		// React is too smart to simply replace the CSS class because of the way it calculates
		// redraws from its shadow-DOM. Changing the key, however, will work.
		notificationIcon = <span className='noticon notification-bubble' key={ 'notification-indicator-animation-state-' + Math.abs( this.props.animationState ) }></span>;

		return (
			<a href='#' onClick={ this.props.toggleNotesFrame } ref='notificationLink' title={ linkTitle }>
				<span className="noticon noticon-bell"></span>
				{ notificationIcon }
				<span className="section-label">{ toolbarTitle }</span>
			</a>
		);
	},

	wordpressIcon() {
		// WP icon replacement for "horizon" environment
		if ( config( 'hostname' ) === 'horizon.wordpress.com' ) {
			return <span className="noticon noticon-horizon" />;
		}

		return <span className="noticon noticon-wordpress" />;
	},

	render() {
		var notificationsClasses = 'notifications',
			notificationsLink = this.renderNotificationsLink(),
			readerUrl = '//wordpress.com/',
			meUrl = '//wordpress.com/me',
			sites = this.props.sites,
			selectedSite = sites.getSelectedSite();

		if ( selectedSite ) {
			// Append site id so that Atlas can maintain the selected site if the
			// user decides to return
			if ( ! selectedSite.primary ) {
				meUrl += '?sid=' + selectedSite.ID;
				readerUrl += '?sid=' + selectedSite.ID;
			}
		}

		if ( config.isEnabled( 'reader' ) ) {
			readerUrl = '/';
		}

		if ( config.isEnabled( 'me/account' ) ) {
			meUrl = '/me';
		}

		// Adjust toolbar highlight and unread status of Notifications
		if ( this.props.showNotes ) {
			notificationsClasses += ' active';
		}
		if ( this.props.newNote ) {
			notificationsClasses += ' unread';
		}
		if ( -1 === this.props.animationState ) {
			notificationsClasses += ' initial-load';
		}

		return (
			<nav className="wpcom-sections">
				<ul className="sections-menu">
					<li className={ this.itemLinkClass( 'sites', { 'my-sites': true } ) }>
						<SiteStatsStickyLink onClick={ this.focusSidebar } title={ this.translate( 'View a list of your sites and access their dashboards', { textOnly: true } ) }>
							{ this.wordpressIcon() }
							<span className="section-label">
								{
									this.props.user.get().visible_site_count > 1
									? this.translate( 'My Sites', { comment: 'Toolbar, must be shorter than ~12 chars' } )
									: this.translate( 'My Site', { comment: 'Toolbar, must be shorter than ~12 chars' } )
								}
							</span>
						</SiteStatsStickyLink>
					</li>
					<li className={ this.itemLinkClass( 'reader', { home: true, reader: true } ) }>
						<a href={ readerUrl } onClick={ this.focusContent } title={ this.translate( 'Read the blogs and topics you follow', { textOnly: true } ) } rel="home">
							<span className="noticon noticon-reader"></span>
							<span className="section-label">{ this.translate( 'Reader', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }</span>
						</a>
					</li>
				</ul>
				<ul className="sections-menu menu-right">
					<MasterbarNewPost
						sites={ this.props.sites }
						active={ 'post' === this.props.section }
						className={ this.itemLinkClass( 'post', { post: true, 'masterbar__post-editor': true, 'new-post': true, 'is-button': true } ) } />
					<li className={ this.itemLinkClass( 'me', { me: true } ) }>
						<a href={ meUrl } onClick={ this.focusSidebar } title={ this.translate( 'Update your profile, personal settings, and more', { textOnly: true } ) }>
							<Gravatar user={ this.props.user.get() } alt="Me" size={ 22 } />
							<span className="section-label">{ this.translate( 'Me', { context: 'Toolbar, must be shorter than ~12 chars' } ) }</span>
						</a>
					</li>
					<li className={ notificationsClasses }>
						{ notificationsLink }
					</li>
				</ul>
			</nav>
		);
	}
} );
