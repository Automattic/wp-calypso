import { isAutomatticianQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { Button, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import {
	bell,
	category,
	code,
	cog,
	commentAuthorAvatar,
	lockOutline,
	notAllowed,
	payment,
	seen,
} from '@wordpress/icons';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { withCurrentRoute } from 'calypso/components/route';
import GlobalSidebar, { GLOBAL_SIDEBAR_EVENTS } from 'calypso/layout/global-sidebar';
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
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getShouldShowGlobalSidebar } from 'calypso/state/global-sidebar/selectors';
import { logoutUser } from 'calypso/state/logout/actions';
import { setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';
import 'calypso/my-sites/sidebar/style.scss'; // Copy styles from the My Sites sidebar.

// Custom MCP icon component
const McpIcon = ( { style } ) => (
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		className="sidebar__menu-icon"
		fill="currentColor"
		aria-hidden="true"
		focusable="false"
		style={ style }
	>
		<title>ModelContextProtocol</title>
		<path d="M15.688 2.343a2.588 2.588 0 00-3.61 0l-9.626 9.44a.863.863 0 01-1.203 0 .823.823 0 010-1.18l9.626-9.44a4.313 4.313 0 016.016 0 4.116 4.116 0 011.204 3.54 4.3 4.3 0 013.609 1.18l.05.05a4.115 4.115 0 010 5.9l-8.706 8.537a.274.274 0 000 .393l1.788 1.754a.823.823 0 010 1.18.863.863 0 01-1.203 0l-1.788-1.753a1.92 1.92 0 010-2.754l8.706-8.538a2.47 2.47 0 000-3.54l-.05-.049a2.588 2.588 0 00-3.607-.003l-7.172 7.034-.002.002-.098.097a.863.863 0 01-1.204 0 .823.823 0 010-1.18l7.273-7.133a2.47 2.47 0 00-.003-3.537z" />
		<path d="M14.485 4.703a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a4.115 4.115 0 000 5.9 4.314 4.314 0 006.016 0l7.12-6.982a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a2.588 2.588 0 01-3.61 0 2.47 2.47 0 010-3.54l7.12-6.982z" />
	</svg>
);

class MeSidebar extends Component {
	handleGlobalSidebarMenuItemClick = ( path ) => {
		if ( ! this.props.shouldShowGlobalSidebar ) {
			return;
		}

		this.props.recordTracksEvent( GLOBAL_SIDEBAR_EVENTS.MENU_ITEM_CLICK, {
			section: 'me',
			path,
		} );
	};

	onNavigate = ( event, path ) => {
		this.props.setNextLayoutFocus( 'content' );
		window.scrollTo( 0, 0 );

		this.handleGlobalSidebarMenuItemClick( path );
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
		const { context } = this.props;
		const props = {
			path: context.path,
			requireBackLink: false,
			siteTitle: this.props.translate( 'Profile' ),
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
		const { context, translate } = this.props;
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
						icon={ commentAuthorAvatar }
						onNavigate={ this.onNavigate }
					/>

					<SidebarItem
						selected={ itemLinkMatches( '/account', path ) }
						link="/me/account"
						label={ translate( 'Account Settings' ) }
						icon={ cog }
						onNavigate={ this.onNavigate }
						preloadSectionName="account"
					/>

					<SidebarItem
						selected={ itemLinkMatches( '/purchases', path ) }
						link={ purchasesRoot }
						label={ translate( 'Purchases' ) }
						icon={ payment }
						onNavigate={ this.onNavigate }
						preloadSectionName="purchases"
					/>

					<SidebarItem
						selected={ itemLinkMatches( '/security', path ) }
						link="/me/security"
						label={ translate( 'Security' ) }
						icon={ lockOutline }
						onNavigate={ this.onNavigate }
						preloadSectionName="security"
					/>

					<SidebarItem
						selected={ itemLinkMatches( '/privacy', path ) }
						link="/me/privacy"
						label={ translate( 'Privacy' ) }
						icon={ seen }
						onNavigate={ this.onNavigate }
						preloadSectionName="privacy"
					/>

					<SidebarItem
						selected={ itemLinkMatches( '/developer', path ) }
						link="/me/developer"
						label={ translate( 'Developer Features' ) }
						icon={ code }
						onNavigate={ this.onNavigate }
						preloadSectionName="developer"
					/>

					{ this.props.isAutomattician && (
						<SidebarItem
							selected={ path.startsWith( '/mcp' ) }
							link="/me/mcp"
							label={ translate( 'MCP' ) + ' (' + translate( 'A8C Only' ) + ')' }
							customIcon={ <McpIcon style={ { padding: '2px', boxSizing: 'border-box' } } /> }
							onNavigate={ this.onNavigate }
							preloadSectionName="mcp"
						/>
					) }

					<SidebarItem
						link="/sites"
						label={ translate( 'Manage Blogs' ) }
						icon={ category }
						forceInternalLink
						onNavigate={ ( event, urlPath ) => {
							this.handleGlobalSidebarMenuItemClick( urlPath );
						} }
					/>

					<SidebarItem
						selected={ itemLinkMatches( '/notifications', path ) }
						link="/me/notifications"
						label={ translate( 'Notification Settings' ) }
						icon={ bell }
						onNavigate={ this.onNavigate }
						preloadSectionName="notification-settings"
					/>

					<SidebarItem
						selected={ itemLinkMatches( '/site-blocks', path ) }
						link="/me/site-blocks"
						label={ translate( 'Blocked Sites' ) }
						icon={ notAllowed }
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

const ConnectedMeSidebar = withCurrentRoute(
	connect(
		( state, { currentSection } ) => {
			const siteId = getSelectedSiteId( state );
			const shouldShowGlobalSidebar = getShouldShowGlobalSidebar( {
				state,
				siteId,
				section: currentSection,
			} );
			return {
				currentUser: getCurrentUser( state ),
				shouldShowGlobalSidebar,
			};
		},
		{
			logoutUser,
			recordGoogleEvent,
			recordTracksEvent,
			redirectToLogout,
			setNextLayoutFocus,
		}
	)( localize( MeSidebar ) )
);

// Wrapper component to add React Query support
function MeSidebarWithQuery( props ) {
	const { data: isAutomattician } = useQuery( isAutomatticianQuery() );
	return <ConnectedMeSidebar { ...props } isAutomattician={ isAutomattician } />;
}

export default MeSidebarWithQuery;
