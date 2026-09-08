import config from '@automattic/calypso-config';
import { STATS_FEATURE_UTM_STATS } from 'calypso/my-sites/stats/constants';
import { shouldGateStats } from 'calypso/my-sites/stats/hooks/use-should-gate-stats';
import isPremiumAnalyticsPreviewCohort, {
	PREMIUM_ANALYTICS_PAGE_PATH,
	PREMIUM_ANALYTICS_PREVIEW_FLAG,
} from 'calypso/my-sites/stats/stats-notices/premium-analytics-preview-cohort';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getSiteFeatures from 'calypso/state/selectors/get-site-features';
import isSiteWpcom from 'calypso/state/selectors/is-site-wpcom';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import getSiteOption from 'calypso/state/sites/selectors/get-site-option';

export type PremiumAnalyticsPreviewCohort = {
	isWpcom: boolean;
	isVip: boolean;
	isP2: boolean;
	canManageOptions: boolean;
	/** Whether the site's features are in - `hasCommercialStats` says nothing until they are. */
	hasSiteFeatures: boolean;
	hasCommercialStats: boolean;
	premiumAnalyticsDashboardUrl: string | null;
	/** The cohort rule and the feature flag together, before anyone asks the site for its status. */
	canBeInvited: boolean;
};

/**
 * Resolve everything the new Traffic tab invitation asks of a site, bar the site's own status.
 *
 * One answer for every surface that offers the invitation - the banner and the modules menu -
 * so a site cannot be invited by one and refused by the other.
 * @param siteId Site to resolve.
 */
export default function usePremiumAnalyticsPreviewCohort(
	siteId: number | null
): PremiumAnalyticsPreviewCohort {
	const isWpcom = useSelector( ( state ) => !! isSiteWpcom( state, siteId ) );
	// `is_vip` is not correctly placed in Odyssey, so we need to check `options.is_vip` as well.
	const isVip = useSelector(
		( state ) =>
			!! isVipSite( state as object, siteId as number ) ||
			!! getSiteOption( state, siteId, 'is_vip' )
	);
	const isP2 = useSelector( ( state ) => !! isSiteWPForTeams( state as object, siteId as number ) );

	// Switching the dashboard on is an administrator's call, and the route enforces the same thing,
	// so anyone else is never offered it — and never spends a request finding that out.
	// Odyssey seeds these capabilities from the site itself, so this holds in both builds.
	const canManageOptions = useSelector(
		( state ) => !! canCurrentUser( state as object, siteId as number, 'manage_options' )
	);

	// The preview is for sites on the commercial Stats tier - the one carrying UTM, device and
	// region/city views. Asking the gate rather than a plan or product flag: those four always
	// move together through it, and it is the same answer Stats itself gives when deciding
	// whether to show them.
	//
	// The features have to be in before that answer means anything: `shouldGateStats` reports
	// "not gated" while they are still loading, which is the safe default for an upsell and the
	// wrong one for an invitation. In wp-admin they arrive with the page, seeded from the site's
	// plan into Odyssey's initial state, which is why `stats-main` skips `QuerySiteFeatures` there.
	const hasSiteFeatures = useSelector( ( state ) => !! getSiteFeatures( state, siteId ) );
	const hasCommercialStats = useSelector(
		( state ) => hasSiteFeatures && ! shouldGateStats( state, siteId, STATS_FEATURE_UTM_STATS )
	);

	// Where accepting would land. Null when the site record carries no `admin_url`, which is
	// part of eligibility rather than the render - see the cohort helper.
	const premiumAnalyticsDashboardUrl = useSelector( ( state ) =>
		getSiteAdminUrl( state, siteId, PREMIUM_ANALYTICS_PAGE_PATH )
	);

	return {
		isWpcom,
		isVip,
		isP2,
		canManageOptions,
		hasSiteFeatures,
		hasCommercialStats,
		premiumAnalyticsDashboardUrl,
		canBeInvited:
			config.isEnabled( PREMIUM_ANALYTICS_PREVIEW_FLAG ) &&
			isPremiumAnalyticsPreviewCohort( {
				isWpcom,
				isVip,
				isP2,
				canManageOptions,
				hasCommercialStats,
				premiumAnalyticsDashboardUrl,
			} ),
	};
}
