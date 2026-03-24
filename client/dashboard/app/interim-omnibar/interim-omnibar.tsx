/* eslint-disable no-restricted-imports */
import { isEcommercePlan } from '@automattic/calypso-products';
import { Provider as ReduxProvider } from 'react-redux';
import { MasterbarLoggedIn } from 'calypso/layout/masterbar/logged-in';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getLogoutUrl } from 'calypso/lib/user/shared-utils';
import type { User, Site } from '@automattic/api-core';

const noop = () => {};

// Fake Redux store so child components using connect() (e.g. Notifications) don't crash.
// Just the three methods react-redux's Provider needs.
const noopStore = {
	getState: () => ( {} ),
	dispatch: () => ( {} ),
	subscribe: () => () => {},
} as unknown as Parameters< typeof ReduxProvider >[ 0 ][ 'store' ];

// Minimal placeholder so MasterbarLoggedIn doesn't crash during SSR.
const emptyUser = {
	display_name: '',
	username: '',
	site_count: 0,
} as unknown as User;

interface Props {
	user: User | null;
	site: Site | null;
}

export function InterimOmnibar( { user: userProp, site }: Props ) {
	const user = userProp ?? emptyUser;
	const siteId = user.primary_blog ?? null;
	const siteSlug = site?.slug ?? null;
	const siteAdminUrl = site?.options?.admin_url ?? null;

	return (
		<ReduxProvider store={ noopStore }>
			<MasterbarLoggedIn
				// User
				user={ user }
				hasNoSites={ user.site_count === 0 }
				// Site identity
				siteId={ siteId }
				site={ site }
				siteSlug={ siteSlug }
				siteTitle={ site?.name ?? '' }
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
				isSimpleSite={ !! site && ! site.jetpack }
				isJetpackNotAtomic={ !! site && site.jetpack && ! site.is_wpcom_atomic }
				domainOnlySite={ !! site?.options?.is_domain_only }
				isUnlaunchedSite={ site?.launch_status === 'unlaunched' }
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
				currentRoute={ typeof window !== 'undefined' ? window.location.pathname : '/' }
				previousPath=""
				newPostUrl={ siteAdminUrl ? `${ siteAdminUrl }post-new.php` : '' }
				newPageUrl={ siteAdminUrl ? `${ siteAdminUrl }post-new.php?post_type=page` : '' }
				// Feature flags
				isCheckout={ false }
				isCheckoutPending={ false }
				isCheckoutFailed={ false }
				loadHelpCenterIcon={ false }
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
				activateNextLayoutFocus={ noop }
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
	);
}
