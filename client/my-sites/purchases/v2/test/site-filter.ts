import { shouldSeedSiteFilter } from '../site-filter';

const siteId = 93798758;

describe( 'shouldSeedSiteFilter', () => {
	it( 'scopes a screen that carries no site filter', () => {
		expect(
			shouldSeedSiteFilter( {
				section: 'activeUpgrades',
				siteId,
				search: '',
			} )
		).toBe( true );
	} );

	it( 'rescopes a screen still filtered by the previously selected site', () => {
		expect(
			shouldSeedSiteFilter( {
				section: 'billingHistory',
				siteId,
				search: '?site=12345',
			} )
		).toBe( true );
	} );

	it( 'leaves a screen already scoped to this site alone', () => {
		expect(
			shouldSeedSiteFilter( {
				section: 'activeUpgrades',
				siteId,
				search: `?site=${ siteId }`,
			} )
		).toBe( false );
	} );

	it( 'leaves the account-level payment methods screen unscoped', () => {
		expect(
			shouldSeedSiteFilter( {
				section: 'paymentMethods',
				siteId,
				search: '',
			} )
		).toBe( false );
	} );

	it( 'leaves a purchase, which has no section of its own, unscoped', () => {
		expect(
			shouldSeedSiteFilter( {
				section: undefined,
				siteId,
				search: '',
			} )
		).toBe( false );
	} );

	it( 'does nothing without a selected site', () => {
		expect(
			shouldSeedSiteFilter( {
				section: 'activeUpgrades',
				siteId: null,
				search: '',
			} )
		).toBe( false );
	} );
} );
