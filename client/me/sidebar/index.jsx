/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import config from '@automattic/calypso-config';
import ProfileGravatar from 'calypso/me/profile-gravatar';
import { purchasesRoot } from 'calypso/me/purchases/paths';
import Sidebar from 'calypso/layout/sidebar';
import SidebarFooter from 'calypso/layout/sidebar/footer';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarMenu from 'calypso/layout/sidebar/menu';
import SidebarRegion from 'calypso/layout/sidebar/region';
import user from 'calypso/lib/user';
import userUtilities from 'calypso/lib/user/utils';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { logoutUser } from 'calypso/state/logout/actions';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { itemLinkMatches } from 'calypso/my-sites/sidebar-unified/utils';

/**
 * Style dependencies
 */
import './style.scss';
import 'calypso/my-sites/sidebar-unified/style.scss'; // nav-unification overrides. Should be removed once launched.

class MeSidebar extends React.Component {
	onNavigate = () => {
		this.props.setNextLayoutFocus( 'content' );
		window.scrollTo( 0, 0 );
	};

	onSignOut = async () => {
		const { currentUser } = this.props;

		// If user is using en locale, redirect to app promo page on sign out
		const isEnLocale = currentUser && currentUser.localeSlug === 'en';

		let redirectTo = null;

		if ( isEnLocale && ! config.isEnabled( 'desktop' ) ) {
			redirectTo = '/?apppromo';
		}

		try {
			const { redirect_to } = await this.props.logoutUser( redirectTo );
			await user().clear();
			window.location.href = redirect_to || '/';
		} catch {
			// The logout endpoint might fail if the nonce has expired.
			// In this case, redirect to wp-login.php?action=logout to get a new nonce generated
			userUtilities.logout( redirectTo );
		}

		this.props.recordGoogleEvent( 'Me', 'Clicked on Sidebar Sign Out Link' );
	};

	render() {
		const { context, translate } = this.props;
		const path = context.path.replace( '/me', '' ); // Remove base path.

		return (
			<Sidebar>
				<SidebarRegion>
					<ProfileGravatar inSidebar user={ this.props.currentUser } />

					<div className="sidebar__me-signout">
						<Button
							compact
							className="sidebar__me-signout-button"
							onClick={ this.onSignOut }
							title={ translate( 'Log out of WordPress.com' ) }
						>
							{ translate( 'Log out' ) }
						</Button>
					</div>

					<SidebarMenu>
						<SidebarItem
							selected={ itemLinkMatches( '', path ) }
							link={ '/me' }
							label={ translate( 'My Profile' ) }
							materialIcon="person"
							onNavigate={ this.onNavigate }
						/>

						<SidebarItem
							selected={ itemLinkMatches( '/account', path ) }
							link={ '/me/account' }
							label={ translate( 'Account Settings' ) }
							materialIcon="settings"
							onNavigate={ this.onNavigate }
							preloadSectionName="account"
						/>

						<SidebarItem
							selected={ itemLinkMatches( '/purchases', path ) }
							link={ purchasesRoot }
							label={ translate( 'Purchases' ) }
							materialIcon="credit_card"
							onNavigate={ this.onNavigate }
							preloadSectionName="purchases"
						/>

						<SidebarItem
							selected={ itemLinkMatches( '/security', path ) }
							link={ '/me/security' }
							label={ translate( 'Security' ) }
							materialIcon="lock"
							onNavigate={ this.onNavigate }
							preloadSectionName="security"
						/>

						<SidebarItem
							selected={ itemLinkMatches( '/privacy', path ) }
							link={ '/me/privacy' }
							label={ translate( 'Privacy' ) }
							materialIcon="visibility"
							onNavigate={ this.onNavigate }
							preloadSectionName="privacy"
						/>

						<SidebarItem
							link={ 'https://dashboard.wordpress.com/wp-admin/index.php?page=my-blogs' }
							label={ translate( 'Manage Blogs' ) }
							materialIcon="apps"
						/>

						<SidebarItem
							selected={ itemLinkMatches( '/notifications', path ) }
							link={ '/me/notifications' }
							label={ translate( 'Notification Settings' ) }
							materialIcon="notifications"
							onNavigate={ this.onNavigate }
							preloadSectionName="notification-settings"
						/>

						<SidebarItem
							selected={ itemLinkMatches( '/site-blocks', path ) }
							link={ '/me/site-blocks' }
							label={ translate( 'Blocked Sites' ) }
							materialIcon="block"
							onNavigate={ this.onNavigate }
							preloadSectionName="site-blocks"
						/>

						<SidebarItem
							selected={ itemLinkMatches( '/get-apps', path ) }
							link={ '/me/get-apps' }
							label={ translate( 'Get Apps' ) }
							icon="my-sites"
							onNavigate={ this.onNavigate }
						/>
					</SidebarMenu>
				</SidebarRegion>
				<SidebarFooter />
			</Sidebar>
		);
	}
}

export default connect(
	( state ) => ( {
		currentUser: getCurrentUser( state ),
	} ),
	{
		logoutUser,
		recordGoogleEvent,
		setNextLayoutFocus,
	}
)( localize( MeSidebar ) );
