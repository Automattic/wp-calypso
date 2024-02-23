import config from '@automattic/calypso-config';
import { Button, Gridicon } from '@automattic/components';
import { englishLocales, localizeUrl } from '@automattic/i18n-utils';
import i18n, { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { withCurrentRoute } from 'calypso/components/route';
import GlobalSidebar from 'calypso/layout/global-sidebar';
import Sidebar from 'calypso/layout/sidebar';
import CollapseSidebar from 'calypso/layout/sidebar/collapse-sidebar';
import SidebarFooter from 'calypso/layout/sidebar/footer';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarMenu from 'calypso/layout/sidebar/menu';
import SidebarRegion from 'calypso/layout/sidebar/region';
import { clearStore, disablePersistence } from 'calypso/lib/user/store';
import ProfileGravatar from 'calypso/me/profile-gravatar';
import { purchasesRoot } from 'calypso/me/purchases/paths';
import { itemLinkMatches } from 'calypso/my-sites/sidebar/utils';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getShouldShowGlobalSidebar } from 'calypso/state/global-sidebar/selectors';
import { logoutUser } from 'calypso/state/logout/actions';
import { setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';
import 'calypso/my-sites/sidebar/style.scss'; // Copy styles from the My Sites sidebar.

class MeSidebar extends Component {
	onNavigate = () => {
		this.props.setNextLayoutFocus( 'content' );
		window.scrollTo( 0, 0 );
	};

	onSignOut = async () => {
		const { currentUser } = this.props;

		// If user is using a supported locale, redirect to app promo page on sign out
		const isSupportedLocale =
			config( 'english_locales' ).includes( currentUser?.localeSlug ) ||
			config( 'magnificent_non_en_locales' ).includes( currentUser?.localeSlug );

		let redirectTo = null;

		if ( isSupportedLocale && ! config.isEnabled( 'desktop' ) ) {
			redirectTo = localizeUrl( 'https://wordpress.com/?apppromo' );
		}

		try {
			const { redirect_to } = await this.props.logoutUser( redirectTo );
			disablePersistence();
			await clearStore();
			window.location.href = redirect_to || '/';
		} catch {
			// The logout endpoint might fail if the nonce has expired.
			// In this case, redirect to wp-login.php?action=logout to get a new nonce generated
			this.props.redirectToLogout( redirectTo );
		}

		this.props.recordGoogleEvent( 'Me', 'Clicked on Sidebar Sign Out Link' );
	};

	renderGlobalSidebar() {
		const props = {
			path: this.props.path,
			requireBackLink: true,
		};
		return <GlobalSidebar { ...props }>{ this.renderMenu( { isGlobal: true } ) }</GlobalSidebar>;
	}

	renderSidebar() {
		const { translate } = this.props;
		return (
			<Sidebar>
				{ this.renderMenu() }
				<CollapseSidebar title={ translate( 'Collapse menu' ) } icon="dashicons-admin-collapse" />
				<SidebarFooter />
			</Sidebar>
		);
	}

	renderMenu( options = {} ) {
		const { context, locale, translate } = this.props;
		const path = context.path.replace( '/me', '' ); // Remove base path.

		const { isGlobal } = options;

		const mainContent = (
			<>
				<ProfileGravatar inSidebar user={ this.props.currentUser } />

				<div className="sidebar__me-signout">
					<Button
						compact
						className="sidebar__me-signout-button"
						onClick={ this.onSignOut }
						title={ translate( 'Log out of WordPress.com' ) }
					>
						<span className="sidebar__me-signout-text">{ translate( 'Log out' ) }</span>
						<Gridicon icon="popout" size={ 16 } />
					</Button>
				</div>

				<SidebarMenu>
					<SidebarItem
						selected={ itemLinkMatches( '', path ) }
						link="/me"
						label={ translate( 'My Profile' ) }
						materialIcon="person"
						onNavigate={ this.onNavigate }
					/>

					<SidebarItem
						selected={ itemLinkMatches( '/account', path ) }
						link="/me/account"
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
						link="/me/security"
						label={ translate( 'Security' ) }
						materialIcon="lock"
						onNavigate={ this.onNavigate }
						preloadSectionName="security"
					/>

					<SidebarItem
						selected={ itemLinkMatches( '/privacy', path ) }
						link="/me/privacy"
						label={ translate( 'Privacy' ) }
						materialIcon="visibility"
						onNavigate={ this.onNavigate }
						preloadSectionName="privacy"
					/>

					<SidebarItem
						selected={ itemLinkMatches( '/developer', path ) }
						link="/me/developer"
						label={ translate( 'Developer Features' ) }
						icon="code"
						onNavigate={ this.onNavigate }
						preloadSectionName="developer"
					/>

					<SidebarItem
						link="https://dashboard.wordpress.com/wp-admin/index.php?page=my-blogs"
						label={ translate( 'Manage Blogs' ) }
						materialIcon="apps"
					/>

					{ ( englishLocales.includes( locale ) ||
						i18n.hasTranslation( 'Manage All Domains' ) ) && (
						<SidebarItem
							link="/domains/manage"
							label={ translate( 'Manage All Domains' ) }
							materialIcon="language"
							forceExternalLink
						/>
					) }

					<SidebarItem
						selected={ itemLinkMatches( '/notifications', path ) }
						link="/me/notifications"
						label={ translate( 'Notification Settings' ) }
						materialIcon="notifications"
						onNavigate={ this.onNavigate }
						preloadSectionName="notification-settings"
					/>

					<SidebarItem
						selected={ itemLinkMatches( '/site-blocks', path ) }
						link="/me/site-blocks"
						label={ translate( 'Blocked Sites' ) }
						materialIcon="block"
						onNavigate={ this.onNavigate }
						preloadSectionName="site-blocks"
					/>

					<SidebarItem
						selected={ itemLinkMatches( '/get-apps', path ) }
						link="/me/get-apps"
						label={ translate( 'Apps' ) }
						icon="plans"
						onNavigate={ this.onNavigate }
					/>
				</SidebarMenu>
			</>
		);

		// The SkipNavigation that SidebarRegion supplies is already added within the global
		// sidebar, only add SidebarRegion if we are not using the global sidebar.
		if ( isGlobal ) {
			return mainContent;
		}

		return <SidebarRegion>{ mainContent }</SidebarRegion>;
	}

	render() {
		if ( this.props.shouldShowGlobalSidebar ) {
			return this.renderGlobalSidebar();
		}
		return this.renderSidebar();
	}
}

export default withCurrentRoute(
	connect(
		( state, { currentSection } ) => {
			const sectionGroup = currentSection?.group ?? null;
			const siteId = getSelectedSiteId( state );
			const shouldShowGlobalSidebar = getShouldShowGlobalSidebar( state, siteId, sectionGroup );
			return {
				currentUser: getCurrentUser( state ),
				shouldShowGlobalSidebar,
			};
		},
		{
			logoutUser,
			recordGoogleEvent,
			redirectToLogout,
			setNextLayoutFocus,
		}
	)( localize( MeSidebar ) )
);
