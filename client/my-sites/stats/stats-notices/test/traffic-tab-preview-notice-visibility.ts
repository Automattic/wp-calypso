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
	canEnableTrafficTabPreview: true,
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

	it( 'stays hidden unless the parent says the site can enable it', () => {
		expect(
			trafficTabPreviewNotice?.isVisibleFunc( {
				...eligibleSite,
				canEnableTrafficTabPreview: false,
			} )
		).toBe( false );
		// Undefined is the shape every other notice sees; it must not read as eligible.
		expect(
			trafficTabPreviewNotice?.isVisibleFunc( {
				...eligibleSite,
				canEnableTrafficTabPreview: undefined,
			} )
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
