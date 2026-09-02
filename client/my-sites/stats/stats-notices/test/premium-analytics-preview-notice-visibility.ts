import {
	processConflictNotices,
	DEFAULT_NOTICES_VISIBILITY,
} from '../../hooks/use-notice-visibility-query';
import ALL_STATS_NOTICES from '../all-notice-definitions';
import type { StatsNoticeProps } from '../types';

const premiumAnalyticsPreviewNotice = ALL_STATS_NOTICES.find(
	( notice ) => notice.noticeId === 'premium_analytics_preview'
);

// An administrator on a cohort site that hasn't switched the dashboard on yet. The parent resolves
// The parent resolves capability, cohort and current status before the registry sees them.
const eligibleSite: StatsNoticeProps = {
	siteId: 123,
	isOdysseyStats: false,
	canManageOptions: true,
	hasCommercialStats: true,
	isPremiumAnalyticsEnabled: false,
	isVip: false,
	isP2: false,
};

describe( 'premium_analytics_preview notice visibility', () => {
	it( 'is registered and enabled', () => {
		expect( premiumAnalyticsPreviewNotice ).toBeDefined();
		expect( premiumAnalyticsPreviewNotice?.disabled ).toBe( false );
	} );

	it( 'shows for an administrator on an eligible site', () => {
		expect( premiumAnalyticsPreviewNotice?.isVisibleFunc( eligibleSite ) ).toBe( true );
	} );

	it( 'does not invite a site that already has the dashboard', () => {
		expect(
			premiumAnalyticsPreviewNotice?.isVisibleFunc( {
				...eligibleSite,
				isPremiumAnalyticsEnabled: true,
			} )
		).toBe( false );
	} );

	/**
	 * Undefined means the site never reported the setting - a Jetpack too old to register it, or a
	 * read that failed. Not the same as off, and it must not read as an invitation to switch on
	 * something the site cannot serve.
	 */
	it( 'stays hidden when the site never reported the setting', () => {
		expect(
			premiumAnalyticsPreviewNotice?.isVisibleFunc( {
				...eligibleSite,
				isPremiumAnalyticsEnabled: undefined,
			} )
		).toBe( false );
	} );

	it( 'stays hidden for anyone who cannot administer the site', () => {
		expect(
			premiumAnalyticsPreviewNotice?.isVisibleFunc( { ...eligibleSite, canManageOptions: false } )
		).toBe( false );
	} );

	/**
	 * The preview is for sites that already have UTM, device and region/city views. A WPCOM site on
	 * FEATURE_STATS_PAID has those gated, so "paid stats" alone is not enough.
	 */
	it( 'stays hidden for a site without the commercial Stats features', () => {
		expect(
			premiumAnalyticsPreviewNotice?.isVisibleFunc( { ...eligibleSite, hasCommercialStats: false } )
		).toBe( false );
		expect(
			premiumAnalyticsPreviewNotice?.isVisibleFunc( {
				...eligibleSite,
				hasCommercialStats: undefined,
			} )
		).toBe( false );
	} );

	it( 'stays out of VIP and P2 sites', () => {
		expect( premiumAnalyticsPreviewNotice?.isVisibleFunc( { ...eligibleSite, isVip: true } ) ).toBe(
			false
		);
		expect( premiumAnalyticsPreviewNotice?.isVisibleFunc( { ...eligibleSite, isP2: true } ) ).toBe(
			false
		);
	} );

	// The purchase-success notices default to visible and outrank everything, so a site that just
	// bought something is not in scope for either case below.
	const noPurchaseJustHappened = {
		...DEFAULT_NOTICES_VISIBILITY,
		client_paid_plan_purchase_success: false,
		client_free_plan_purchase_success: false,
	};

	/**
	 * `tier_upgrade` is the notice this one can genuinely turn up beside: it wants a site with
	 * commercial use, and so does the invitation. The upsells need a site without paid Stats, so
	 * they are covered here for completeness rather than because the combination is reachable.
	 */
	it( 'outranks the near-limit warning, so an eligible site is invited rather than warned', () => {
		const resolved = processConflictNotices( {
			...noPurchaseJustHappened,
			premium_analytics_preview: true,
			tier_upgrade: true,
			free_site_upgrade: true,
		} );

		expect( resolved.premium_analytics_preview ).toBe( true );
		expect( resolved.tier_upgrade ).toBe( false );
		expect( resolved.free_site_upgrade ).toBe( false );
	} );

	it( 'leaves the rest of the group alone when the site is not being invited', () => {
		const resolved = processConflictNotices( {
			...noPurchaseJustHappened,
			premium_analytics_preview: false,
			tier_upgrade: true,
		} );

		expect( resolved.tier_upgrade ).toBe( true );
	} );
} );
