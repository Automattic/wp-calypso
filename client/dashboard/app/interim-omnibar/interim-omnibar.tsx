/* eslint-disable no-restricted-imports */
import { isEcommercePlan } from '@automattic/calypso-products';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { MasterbarLoggedIn } from 'calypso/layout/masterbar/logged-in';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getLogoutUrl } from 'calypso/lib/user/shared-utils';
import { getSiteDisplayName } from '../../utils/site-name';
import type { User, Site } from '@automattic/api-core';

const noop = () => {};

type StoreType = Parameters< typeof ReduxProvider >[ 0 ][ 'store' ];

// Module-level state shared between the exported setters and the fake store.
// There is only ever one omnibar store instance at a time.
let storeIsNotificationsOpen = false;
const storeListeners = new Set< () => void >();

function notifyStoreListeners() {
	storeListeners.forEach( ( listener ) => listener() );
}

/**
 * Setters that the dashboard calls to sync open/close state into the
 * omnibar so that masterbar icons reflect the correct active state.
 */
export const omnibarState = {
	/** Syncs into the fake Redux store so the notification bell's connect() re-renders. */
	setIsNotificationsOpen( isOpen: boolean ) {
		storeIsNotificationsOpen = isOpen;
		notifyStoreListeners();
	},
	/**
	 * Toggles a class on #wpcom-omnibar (which React doesn't own) so a CSS
	 * rule can style the help icon without being overwritten by React.
	 */
	setIsHelpCenterOpen( isOpen: boolean ) {
		document.getElementById( 'wpcom-omnibar' )?.classList.toggle( 'is-help-center-open', isOpen );
	},
};

// Fake Redux store so child components using connect() (e.g. Notifications) don't crash.
// Intercepts specific actions so the dashboard can handle them.
function createOmnibarStore( user: User | null, onToggleNotifications?: () => void ): StoreType {
	let notificationsUnseenCount: number | undefined;

	const store = {
		getState: () => ( {
			ui: { section: false, isNotificationsOpen: storeIsNotificationsOpen },
			currentUser: { user },
			notificationsUnseenCount,
		} ),
		dispatch: ( action: { type: string; unseenCount?: number } ) => {
			if ( action.type === 'NOTIFICATIONS_PANEL_TOGGLE' ) {
				notificationsUnseenCount = 0;
				notifyStoreListeners();

				onToggleNotifications?.();
			}
			if ( action.type === 'NOTIFICATIONS_UNSEEN_COUNT_SET' ) {
				notificationsUnseenCount = action.unseenCount;
				notifyStoreListeners();
			}
			return action;
		},
		subscribe: ( listener: () => void ) => {
			storeListeners.add( listener );
			return () => storeListeners.delete( listener );
		},
	};
	return store as unknown as StoreType;
}

// Separate query client for the legacy masterbar so its internal queries
// (e.g. useGetDomainsQuery in MasterbarLaunchButton) don't pollute the Dashboard cache.
const omnibarQueryClient = new QueryClient();

// Minimal placeholder so MasterbarLoggedIn doesn't crash during SSR.
const emptyUser = {
	display_name: '',
	username: '',
	site_count: 0,
} as unknown as User;

interface Props {
	user: User | null;
	site: Site | null;
	currentRoute: string;
	onToggleMenu?: () => void;
	onToggleNotifications?: () => void;
}

export function InterimOmnibar( {
	user: userProp,
	site,
	currentRoute,
	onToggleMenu,
	onToggleNotifications,
}: Props ) {
	const user = userProp ?? emptyUser;
	const siteId = user.primary_blog ?? null;
	const siteSlug = site?.slug ?? null;
	const siteAdminUrl = site?.options?.admin_url ?? null;
	const store = useMemo(
		() => createOmnibarStore( user, onToggleNotifications ),
		[ user, onToggleNotifications ]
	);

	return (
		<QueryClientProvider client={ omnibarQueryClient }>
			<ReduxProvider store={ store }>
				<MasterbarLoggedIn
					// User
					user={ user }
					hasNoSites={ user.site_count === 0 }
					// Site identity
					siteId={ siteId }
					site={ site }
					siteSlug={ siteSlug }
					siteTitle={ site ? getSiteDisplayName( site ) : '' }
					siteUrl={ site?.URL ?? '' }
					siteAdminUrl={ siteAdminUrl }
					siteHomeUrl={ site?.URL ?? '' }
					sitePlanName={ site?.plan?.product_name_short ?? '' }
					currentSelectedSiteSlug={ siteSlug }
					// TODO: Audit site-specific flags to see which we need to handle in the interim omnibar, and which can be hardcoded to false.
					// Site flags
					isEcommerce={ isEcommercePlan( site?.plan?.product_slug ?? '' ) }
					// isClassicView={ !! site && siteUsesWpAdminInterface( site ) }
					isClassicView
					// TODO: Causes hydration mismatch unless client and server both have the same site object
					isSimpleSite={ false }
					isJetpackNotAtomic={ !! site && site.jetpack && ! site.is_wpcom_atomic }
					domainOnlySite={ !! site?.options?.is_domain_only }
					isUnlaunchedSite={ false }
					isTrial={ false }
					isSiteP2={ !! site?.options?.is_wpforteams_site }
					isP2Hub={ !! site?.options?.p2_hub_blog_id && site.options.p2_hub_blog_id === site.ID }
					isManageSiteOptionsEnabled={ !! site?.capabilities?.manage_options }
					isA4ADevSite={ !! site?.is_a4a_dev_site }
					isAtomicAndEditingToolkitDeactivated={ false }
					// Navigation / layout
					section=""
					sectionGroup=""
					currentLayoutFocus={ null }
					currentRoute={ currentRoute }
					previousPath=""
					newPostUrl={ siteAdminUrl ? `${ siteAdminUrl }post-new.php` : '' }
					newPageUrl={ siteAdminUrl ? `${ siteAdminUrl }post-new.php?post_type=page` : '' }
					// Feature flags
					isCheckout={ false }
					isCheckoutPending={ false }
					isCheckoutFailed={ false }
					loadHelpCenterIcon
					isGlobalSidebarVisible={ false }
					isGravatarDomain={ false }
					dashboardOptIn
					useUnifiedAgent={ false }
					isSupportSession={ false }
					isNotificationsShowing={ false }
					isMigrationInProgress={ false }
					migrationStatus={ null }
					adminMenu={ null }
					// Actions
					setNextLayoutFocus={ noop }
					activateNextLayoutFocus={ () => onToggleMenu?.() }
					recordTracksEvent={ recordTracksEvent }
					updateSiteMigrationMeta={ noop }
					savePreference={ noop }
					requestAdminMenu={ noop }
					redirectToLogout={ () => {
						if ( userProp ) {
							const logoutUrl = getLogoutUrl( userProp );
							window.location.href = logoutUrl;
						}
					} }
					launchSiteOrRedirectToLaunchSignupFlow={ noop }
				/>
			</ReduxProvider>
		</QueryClientProvider>
	);
}
