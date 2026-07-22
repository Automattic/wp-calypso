/* eslint-disable no-restricted-imports */
import { useShouldUseUnifiedAgent } from '@automattic/agents-manager';
import {
	purchaseQuery,
	queryClient,
	siteCurrentPlanQuery,
	siteHourlyViewsQuery,
} from '@automattic/api-queries';
import { isEcommercePlan } from '@automattic/calypso-products';
import { isSupportSession } from '@automattic/calypso-support-session';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { localize } from 'i18n-calypso';
import { useEffect, useMemo } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { MasterbarLoggedIn } from 'calypso/layout/masterbar/logged-in';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { StatsSparkline } from '../../components/stats-sparkline';
import { getSiteDisplayName } from '../../utils/site-name';
import { isSimple } from '../../utils/site-types';
import { getSitePlanUrl } from '../../utils/site-url';
import { logout } from '../auth';
import { omnibarEvents, useOmnibarEvent } from '../omnibar/events';
import { getUserLanguage } from '../shared-locale-loader';
import { OmnibarLaunchButton } from './omnibar-launch-button';
import { createOmnibarStore } from './omnibar-store';
import type { User, Site } from '@automattic/api-core';

const LocalizedMasterbarLoggedIn = localize( MasterbarLoggedIn );

const noop = () => {};

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
	const siteId = site?.ID ?? null;
	const siteSlug = site?.slug ?? null;
	const siteAdminUrl = site?.options?.admin_url ?? null;
	const isUnlaunchedSite = !! site && site.launch_status === 'unlaunched' && ! site.is_a4a_dev_site;
	const isSimpleSite = !! site && isSimple( site );

	const { data: currentPlan } = useQuery(
		{
			...siteCurrentPlanQuery( site?.ID ?? 0 ),
			enabled: !! site,
		},
		queryClient
	);
	const { data: planPurchase } = useQuery(
		{
			...purchaseQuery( currentPlan?.id ?? 0 ),
			enabled: !! currentPlan?.id,
		},
		queryClient
	);
	const sitePlanUrl = site ? getSitePlanUrl( site, planPurchase ) : undefined;

	const { data: hourlyViews } = useQuery(
		{
			...siteHourlyViewsQuery( site?.ID ?? 0 ),
			enabled: !! site,
		},
		queryClient
	);

	const store = useMemo(
		() =>
			createOmnibarStore( {
				onToggleNotifications,
				initialLocaleSlug: getUserLanguage( user ),
			} ),
		// Seed the store's locale once; later changes flow through the switcher.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ onToggleNotifications ]
	);

	// Announce the bell button element to subscribers (e.g. the Notifications
	// component) so they can anchor a popover to it. Re-runs on every commit so
	// it stays correct if MasterbarLoggedIn re-renders and replaces the node.
	useEffect( () => {
		const container = document.getElementById( 'wpcom-omnibar' );
		const bell = container?.querySelector< HTMLElement >( '.masterbar-notifications' ) ?? null;
		omnibarEvents.notificationsAnchor.emit( bell );
	} );

	// Dispatch the user's unseen note count to the store so the unread marker appears.
	useEffect( () => {
		store.dispatch( {
			type: 'NOTIFICATIONS_UNSEEN_COUNT_SET',
			unseenCount: Number( !! user.has_unseen_notes ),
		} );
	}, [ store, user.has_unseen_notes ] );

	// Sync the notifications open state (e.g. when the panel closes externally).
	useOmnibarEvent( 'notificationsOpen', ( isOpen ) => {
		store.dispatch( { type: 'NOTIFICATIONS_OPEN_SET', isOpen } );
	} );

	// Also dispatch the emitted unseen note count from the notifications panel.
	useOmnibarEvent( 'notificationsUnseenCount', ( unseenCount ) => {
		store.dispatch( { type: 'NOTIFICATIONS_UNSEEN_COUNT_SET', unseenCount } );
	} );

	// The masterbar's own client, not the Dashboard one: that client is restored from
	// storage, so a cached flag would resolve on the first render and mismatch the SSR.
	const shouldUseUnifiedAgent = useShouldUseUnifiedAgent( omnibarQueryClient );

	return (
		<QueryClientProvider client={ omnibarQueryClient }>
			<ReduxProvider store={ store }>
				<LocalizedMasterbarLoggedIn
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
					sitePlanUrl={ sitePlanUrl }
					currentSelectedSiteSlug={ siteSlug }
					// TODO: Audit site-specific flags to see which we need to handle in the interim omnibar, and which can be hardcoded to false.
					// Site flags
					isEcommerce={ isEcommercePlan( site?.plan?.product_slug ?? '' ) }
					// isClassicView={ !! site && siteUsesWpAdminInterface( site ) }
					isClassicView
					isSimpleSite={ isSimpleSite }
					isJetpackNotAtomic={ !! site && site.jetpack && ! site.is_wpcom_atomic }
					domainOnlySite={ !! site?.options?.is_domain_only }
					canUserViewStats={ !! site }
					statsAdminUrl={ siteAdminUrl ? `${ siteAdminUrl }admin.php?page=stats` : undefined }
					statsSparkline={
						hourlyViews && hourlyViews.length > 0 ? (
							<StatsSparkline hourlyViews={ hourlyViews } />
						) : undefined
					}
					isUnlaunchedSite={ isUnlaunchedSite }
					launchButton={ isUnlaunchedSite && site ? <OmnibarLaunchButton site={ site } /> : null }
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
					loadAgentsManager
					isGlobalSidebarVisible={ false }
					isGravatarDomain={ false }
					dashboardOptIn
					useUnifiedAgent={ !! shouldUseUnifiedAgent }
					isSupportSession={ isSupportSession() }
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
							logout( userProp );
						}
					} }
					launchSiteOrRedirectToLaunchSignupFlow={ noop }
				/>
			</ReduxProvider>
		</QueryClientProvider>
	);
}
