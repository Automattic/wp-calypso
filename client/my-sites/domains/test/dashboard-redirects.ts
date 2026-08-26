import { dashboardDomainManagementLink } from '../dashboard-redirects';

describe( 'dashboardDomainManagementLink', () => {
	it( 'opens the change site address flow for a site’s WordPress.com address', () => {
		expect(
			dashboardDomainManagementLink( {
				domain: 'example.wordpress.com',
				site: 'example.wordpress.com',
			} )
		).toEqual( '/sites/example.wordpress.com/domains?action=change-site-address' );
	} );

	it( 'opens it for a WordPress.com address on a site whose primary domain is custom', () => {
		expect(
			dashboardDomainManagementLink( { domain: 'example.wordpress.com', site: 'example.com' } )
		).toEqual( '/sites/example.com/domains?action=change-site-address' );
	} );

	it( 'sends a staging address to the site’s domains, where there is nothing to change', () => {
		expect(
			dashboardDomainManagementLink( {
				domain: 'example.wpcomstaging.com',
				site: 'example.wpcomstaging.com',
			} )
		).toEqual( '/sites/example.wpcomstaging.com/domains' );
	} );

	it( 'sends a registered domain to its own overview', () => {
		expect(
			dashboardDomainManagementLink( { domain: 'example.com', site: 'example.com' } )
		).toEqual( '/domains/example.com' );
	} );

	it( 'falls back to the domain overview without a site', () => {
		expect( dashboardDomainManagementLink( { domain: 'example.wordpress.com' } ) ).toEqual(
			'/domains/example.wordpress.com'
		);
	} );
} );
