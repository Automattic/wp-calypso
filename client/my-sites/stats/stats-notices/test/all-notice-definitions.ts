import ALL_STATS_NOTICES from '../all-notice-definitions';
import type { StatsNoticeProps } from '../types';

const commercialSiteUpgradeNotice = ALL_STATS_NOTICES.find(
	( notice ) => notice.noticeId === 'commercial_site_upgrade'
);

// A self-hosted Jetpack site flagged commercial, with no purchase supporting commercial use —
// the population that carried the `jetpack-site-has-commercial-paywall` sticker.
const walledJetpackSite: StatsNoticeProps = {
	siteId: 123,
	isOdysseyStats: false,
	isSiteJetpackNotAtomic: true,
	isCommercial: true,
	isVip: false,
	hasPaidStats: false,
	supportCommercialUse: false,
};

// Skipped: the notice is disabled in the registry, replaced by `free_site_upgrade`.
// Kept intact for kill-switch flip-back, alongside the notice itself.
// eslint-disable-next-line jest/no-disabled-tests
describe.skip( 'commercial_site_upgrade notice visibility', () => {
	it( 'is registered and enabled', () => {
		expect( commercialSiteUpgradeNotice ).toBeDefined();
		expect( commercialSiteUpgradeNotice?.disabled ).toBe( false );
	} );

	it( 'still shows for a previously walled commercial Jetpack site once the sticker is ignored', () => {
		expect(
			commercialSiteUpgradeNotice?.isVisibleFunc( {
				...walledJetpackSite,
				showPaywallNotice: false,
			} )
		).toBe( true );
	} );

	it( 'shows for a commercial WPCOM site, which never had the paywall variant', () => {
		expect(
			commercialSiteUpgradeNotice?.isVisibleFunc( {
				...walledJetpackSite,
				isSiteJetpackNotAtomic: false,
				isWpcom: true,
				showPaywallNotice: false,
			} )
		).toBe( true );
	} );

	it( 'stays hidden for non-commercial and VIP sites', () => {
		expect(
			commercialSiteUpgradeNotice?.isVisibleFunc( { ...walledJetpackSite, isCommercial: false } )
		).toBe( false );
		expect(
			commercialSiteUpgradeNotice?.isVisibleFunc( { ...walledJetpackSite, isVip: true } )
		).toBe( false );
	} );

	it( 'stays hidden once the site has paid stats', () => {
		expect(
			commercialSiteUpgradeNotice?.isVisibleFunc( { ...walledJetpackSite, hasPaidStats: true } )
		).toBe( false );
	} );
} );
