import {
	processConflictNotices,
	DEFAULT_NOTICES_VISIBILITY,
} from '../../hooks/use-notice-visibility-query';
import ALL_STATS_NOTICES from '../all-notice-definitions';
import type { StatsNoticeProps } from '../types';

const trafficTabPreviewNotice = ALL_STATS_NOTICES.find(
	( notice ) => notice.noticeId === 'traffic_tab_preview'
);

// An administrator on a cohort site that hasn't switched the dashboard on yet. The parent resolves
// `canEnableTrafficTabPreview` — capability, cohort and current status all fold into it.
const eligibleSite: StatsNoticeProps = {
	siteId: 123,
	isOdysseyStats: false,
	canManageOptions: true,
	hasAdvancedStats: true,
	isPremiumAnalyticsEnabled: false,
	isVip: false,
	isP2: false,
};

describe( 'traffic_tab_preview notice visibility', () => {
	it( 'is registered and enabled', () => {
		expect( trafficTabPreviewNotice ).toBeDefined();
		expect( trafficTabPreviewNotice?.disabled ).toBe( false );
	} );

	it( 'shows for an administrator on an eligible site', () => {
		expect( trafficTabPreviewNotice?.isVisibleFunc( eligibleSite ) ).toBe( true );
	} );

	it( 'does not invite a site that already has the dashboard', () => {
		expect(
			trafficTabPreviewNotice?.isVisibleFunc( {
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
			trafficTabPreviewNotice?.isVisibleFunc( {
				...eligibleSite,
				isPremiumAnalyticsEnabled: undefined,
			} )
		).toBe( false );
	} );

	it( 'stays hidden for anyone who cannot administer the site', () => {
		expect(
			trafficTabPreviewNotice?.isVisibleFunc( { ...eligibleSite, canManageOptions: false } )
		).toBe( false );
	} );

	/**
	 * The preview is for sites that already have UTM, device and region/city views. A WPCOM site on
	 * FEATURE_STATS_PAID has those gated, so "paid stats" alone is not enough.
	 */
	it( 'stays hidden for a site without the advanced Stats features', () => {
		expect(
			trafficTabPreviewNotice?.isVisibleFunc( { ...eligibleSite, hasAdvancedStats: false } )
		).toBe( false );
		expect(
			trafficTabPreviewNotice?.isVisibleFunc( { ...eligibleSite, hasAdvancedStats: undefined } )
		).toBe( false );
	} );

	it( 'stays out of VIP and P2 sites', () => {
		expect( trafficTabPreviewNotice?.isVisibleFunc( { ...eligibleSite, isVip: true } ) ).toBe(
			false
		);
		expect( trafficTabPreviewNotice?.isVisibleFunc( { ...eligibleSite, isP2: true } ) ).toBe(
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

	it( 'outranks the upsell notices, so an eligible site is invited rather than upsold', () => {
		const resolved = processConflictNotices( {
			...noPurchaseJustHappened,
			traffic_tab_preview: true,
			free_site_upgrade: true,
			tier_upgrade: true,
		} );

		expect( resolved.traffic_tab_preview ).toBe( true );
		expect( resolved.free_site_upgrade ).toBe( false );
		expect( resolved.tier_upgrade ).toBe( false );
	} );

	it( 'leaves the upsells alone when the site is not being invited', () => {
		const resolved = processConflictNotices( {
			...noPurchaseJustHappened,
			traffic_tab_preview: false,
			free_site_upgrade: true,
		} );

		expect( resolved.free_site_upgrade ).toBe( true );
	} );
} );
