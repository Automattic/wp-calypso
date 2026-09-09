import { shouldSeedSiteFilter } from '../site-filter';

const siteId = 93798758;

describe( 'shouldSeedSiteFilter', () => {
	it( 'scopes a screen to the site on first arrival', () => {
		expect(
			shouldSeedSiteFilter( {
				section: 'activeUpgrades',
				previousSection: undefined,
				siteId,
				search: '',
			} )
		).toBe( true );
	} );

	it( 'rescopes when the section tabs move to another screen', () => {
		expect(
			shouldSeedSiteFilter( {
				section: 'billingHistory',
				previousSection: 'activeUpgrades',
				siteId,
				search: '',
			} )
		).toBe( true );
	} );

	it( 'rescopes on return to a screen already visited in this session', () => {
		expect(
			shouldSeedSiteFilter( {
				section: 'activeUpgrades',
				previousSection: 'billingHistory',
				siteId,
				search: '',
			} )
		).toBe( true );
	} );

	it( 'rescopes on return from a purchase, which has no section of its own', () => {
		expect(
			shouldSeedSiteFilter( {
				section: 'activeUpgrades',
				previousSection: undefined,
				siteId,
				search: '',
			} )
		).toBe( true );
	} );

	it( 'leaves a filter widened in place alone', () => {
		expect(
			shouldSeedSiteFilter( {
				section: 'activeUpgrades',
				previousSection: 'activeUpgrades',
				siteId,
				search: '',
			} )
		).toBe( false );
	} );

	it( 'does not disturb a site filter already in the URL', () => {
		expect(
			shouldSeedSiteFilter( {
				section: 'activeUpgrades',
				previousSection: 'billingHistory',
				siteId,
				search: '?site=12345',
			} )
		).toBe( false );
	} );

	it( 'leaves the account-level payment methods screen unscoped', () => {
		expect(
			shouldSeedSiteFilter( {
				section: 'paymentMethods',
				previousSection: 'activeUpgrades',
				siteId,
				search: '',
			} )
		).toBe( false );
	} );

	it( 'does nothing without a selected site', () => {
		expect(
			shouldSeedSiteFilter( {
				section: 'activeUpgrades',
				previousSection: undefined,
				siteId: null,
				search: '',
			} )
		).toBe( false );
	} );
} );
