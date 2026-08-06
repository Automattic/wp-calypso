import { COMMERCIAL_PAYWALL_KILLED } from 'calypso/state/stats/plan-usage/constants';
import ALL_STATS_NOTICES from '../all-notice-definitions';
import type { StatsNoticeProps } from '../types';

const freeSiteUpgradeNotice = ALL_STATS_NOTICES.find(
	( notice ) => notice.noticeId === 'free_site_upgrade'
);

// A self-hosted Jetpack site with no purchase supporting commercial use. Commercial-flagged
// sites — the population that carried the `jetpack-site-has-commercial-paywall` sticker —
// are upsold under exactly the same rules now that the paywall is ignored.
const freeJetpackSite: StatsNoticeProps = {
	siteId: 123,
	isOdysseyStats: false,
	isSiteJetpackNotAtomic: true,
	isVip: false,
	hasPaidStats: false,
};

describe( 'free_site_upgrade notice visibility', () => {
	it( 'is enabled opposite the notices it replaces, keyed to the paywall kill switch', () => {
		expect( freeSiteUpgradeNotice ).toBeDefined();
		expect( freeSiteUpgradeNotice?.disabled ).toBe( ! COMMERCIAL_PAYWALL_KILLED );
		expect(
			ALL_STATS_NOTICES.find( ( notice ) => notice.noticeId === 'do_you_love_jetpack_stats' )
				?.disabled
		).toBe( COMMERCIAL_PAYWALL_KILLED );
		expect(
			ALL_STATS_NOTICES.find( ( notice ) => notice.noticeId === 'commercial_site_upgrade' )
				?.disabled
		).toBe( COMMERCIAL_PAYWALL_KILLED );
	} );

	it( 'shows for a free self-hosted Jetpack site, commercial-flagged or not', () => {
		expect( freeSiteUpgradeNotice?.isVisibleFunc( freeJetpackSite ) ).toBe( true );
		expect(
			freeSiteUpgradeNotice?.isVisibleFunc( { ...freeJetpackSite, isCommercial: true } )
		).toBe( true );
	} );

	it( 'shows in Odyssey Stats', () => {
		expect(
			freeSiteUpgradeNotice?.isVisibleFunc( {
				...freeJetpackSite,
				isSiteJetpackNotAtomic: false,
				isOdysseyStats: true,
			} )
		).toBe( true );
	} );

	it( 'shows for a WPCOM site once it has significant views', () => {
		const wpcomSite = {
			...freeJetpackSite,
			isSiteJetpackNotAtomic: false,
			isWpcom: true,
		};
		expect(
			freeSiteUpgradeNotice?.isVisibleFunc( { ...wpcomSite, hasSignificantViews: true } )
		).toBe( true );
		expect( freeSiteUpgradeNotice?.isVisibleFunc( wpcomSite ) ).toBe( false );
	} );

	it( 'defers to the full-size WPCOM upsell and skips P2 and Team51 sites', () => {
		const wpcomSite = {
			...freeJetpackSite,
			isSiteJetpackNotAtomic: false,
			isWpcom: true,
			hasSignificantViews: true,
		};
		expect( freeSiteUpgradeNotice?.isVisibleFunc( { ...wpcomSite, hasWpcomUpsell: true } ) ).toBe(
			false
		);
		expect( freeSiteUpgradeNotice?.isVisibleFunc( { ...wpcomSite, isP2: true } ) ).toBe( false );
		expect( freeSiteUpgradeNotice?.isVisibleFunc( { ...wpcomSite, isOwnedByTeam51: true } ) ).toBe(
			false
		);
	} );

	it( 'stays hidden for VIP sites', () => {
		expect( freeSiteUpgradeNotice?.isVisibleFunc( { ...freeJetpackSite, isVip: true } ) ).toBe(
			false
		);
	} );

	it( 'stays hidden once the site has paid stats', () => {
		expect(
			freeSiteUpgradeNotice?.isVisibleFunc( { ...freeJetpackSite, hasPaidStats: true } )
		).toBe( false );
	} );
} );
