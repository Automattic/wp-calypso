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
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'MasterbarSectionsMenu',

	itemLinkClass( section, classes ) {
		classes = classes || {};
		classes[ 'is-active' ] = ( section === this.props.section && ! this.props.showNotes );
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
			<a href="#" onClick={ this.props.toggleNotesFrame } ref="notificationLink" title={ linkTitle }>
				<Gridicon icon="bell" size={ 24 } />
				{ notificationIcon }
				<span className="masterbar__label">{ toolbarTitle }</span>
			</a>
		);
	},

	wordpressIcon() {
		// WP icon replacement for "horizon" environment
		if ( config( 'hostname' ) === 'horizon.wordpress.com' ) {
			return <span className="noticon noticon-horizon" />;
		}

		return <Gridicon icon="my-sites" size={ 24 } />;
	},

	render() {
		var notificationsClasses = 'masterbar__notifications masterbar__item',
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
			notificationsClasses += ' is-active';
		}
		if ( this.props.newNote ) {
			notificationsClasses += ' has-unread';
		}
		if ( -1 === this.props.animationState ) {
			notificationsClasses += ' is-initial-load';
		}

		return (
			<nav className="masterbar__sections">
				<ul className="masterbar__sections-menu">
					<li className={ this.itemLinkClass( 'sites', { 'masterbar__item': true, 'masterbar__my-sites': true } ) }>
						<SiteStatsStickyLink onClick={ this.focusSidebar } title={ this.translate( 'View a list of your sites and access their dashboards', { textOnly: true } ) }>
							{ this.wordpressIcon() }
							<span className="masterbar__label">
								{
									this.props.user.get().visible_site_count > 1
									? this.translate( 'My Sites', { comment: 'Toolbar, must be shorter than ~12 chars' } )
									: this.translate( 'My Site', { comment: 'Toolbar, must be shorter than ~12 chars' } )
								}
							</span>
						</SiteStatsStickyLink>
					</li>
					<li className={ this.itemLinkClass( 'reader', { 'masterbar__item': true, 'masterbar__home': true, 'masterbar__reader': true } ) }>
						<a href={ readerUrl } onClick={ this.focusContent } title={ this.translate( 'Read the blogs and topics you follow', { textOnly: true } ) } rel="home">
							<Gridicon icon="reader" size={ 24 } />
							<span className="masterbar__label">
								{ this.translate( 'Reader', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }
							</span>
						</a>
					</li>
				</ul>
				<ul className="masterbar__sections-menu is-right">
					<MasterbarNewPost
						sites={ this.props.sites }
						active={ 'post' === this.props.section }
						className={ this.itemLinkClass( 'post', { 'masterbar__item': true, 'masterbar__editor': true } ) }
					/>
					<li className={ this.itemLinkClass( 'me', { 'masterbar__item': true, 'masterbar__me': true } ) }>
						<a href={ meUrl } onClick={ this.focusSidebar } title={ this.translate( 'Update your profile, personal settings, and more', { textOnly: true } ) }>
							<Gravatar user={ this.props.user.get() } alt="Me" size={ 18 } />
							<span className="masterbar__label">
								{ this.translate( 'Me', { context: 'Toolbar, must be shorter than ~12 chars' } ) }
							</span>
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
