/* eslint-disable no-restricted-imports */
import { isEcommercePlan } from '@automattic/calypso-products';
import { Provider as ReduxProvider } from 'react-redux';
import { MasterbarLoggedIn } from 'calypso/layout/masterbar/logged-in';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getLogoutUrl } from 'calypso/lib/user/shared-utils';
import { siteUsesWpAdminInterface } from 'calypso/sites-dashboard/utils';
import type { User } from '@automattic/api-core';
import type { Site } from '@automattic/api-core/src/site/types';

const noop = () => {};

// Fake Redux store so child components using connect() (e.g. Notifications) don't crash.
// Just the three methods react-redux's Provider needs.
const noopStore = {
	getState: () => ( {} ),
	dispatch: () => ( {} ),
	subscribe: () => () => {},
};

interface Props {
	user: User;
	site: Site | null;
}

export function InterimOmnibar( { user, site }: Props ) {
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
				// Site flags
				isEcommerce={ isEcommercePlan( site?.plan?.product_slug ) }
				isClassicView={ !! site && siteUsesWpAdminInterface( site ) }
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
				currentRoute={ window.location.pathname }
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
					const logoutUrl = getLogoutUrl( user );
					window.location.href = logoutUrl;
				} }
				launchSiteOrRedirectToLaunchSignupFlow={ noop }
			/>
		</ReduxProvider>
	);
}
