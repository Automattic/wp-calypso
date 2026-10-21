import { filterUpsellsBySiteFeatures, getAvailableUpsells } from '../upsell-card/available-upsells';

// Feature slugs a site on Jetpack Security (Daily) reports: Backup, Scan and
// Anti-spam are bundled, but not Search, VideoPress, Boost or Social.
const SECURITY_DAILY_FEATURES = [
	'antispam',
	'backups',
	'backups-daily',
	'full-activity-log',
	'scan',
];

describe( 'filterUpsellsBySiteFeatures', () => {
	const upsells = getAvailableUpsells();
	const visibleSlugs = ( siteFeatures: string[] ) =>
		filterUpsellsBySiteFeatures( upsells, siteFeatures ).map( ( upsell ) => upsell.slug );

	it( 'shows all upsells when the site has no features', () => {
		expect( visibleSlugs( [] ) ).toEqual( [
			'security',
			'backup',
			'search',
			'video',
			'boost',
			'social',
		] );
	} );

	it( 'hides the Backup and Security upsells when a plan already bundles them', () => {
		expect( visibleSlugs( SECURITY_DAILY_FEATURES ) ).toEqual( [
			'search',
			'video',
			'boost',
			'social',
		] );
	} );

	it( 'hides the Backup upsell but keeps Security when only Backup is owned', () => {
		expect( visibleSlugs( [ 'backups' ] ) ).toEqual( [
			'security',
			'search',
			'video',
			'boost',
			'social',
		] );
	} );

	it( 'hides every upsell when the site has all owned features', () => {
		const allOwnedFeatures = upsells.flatMap( ( upsell ) => upsell.ownedFeatures );
		expect( visibleSlugs( allOwnedFeatures ) ).toEqual( [] );
	} );
} );
