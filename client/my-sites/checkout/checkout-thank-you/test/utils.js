import { getActivationCompletedLink } from '../utils';

describe( 'getActivationCompletedLink', () => {
	it( 'return link to /landing section in cloud when there is no valid site or product slug', () => {
		const validProductInvalidSite = getActivationCompletedLink( 'jetpack_scan', null, null );
		expect( validProductInvalidSite ).toBe( 'https://cloud.jetpack.com/landing' );

		const validSiteInvalidProduct = getActivationCompletedLink(
			null,
			'mysite.wordpress.com',
			null
		);
		expect( validSiteInvalidProduct ).toBe(
			'https://cloud.jetpack.com/landing/mysite.wordpress.com'
		);
	} );

	it( 'return link to /backup if a Backup product and a valid site are given', () => {
		const response = getActivationCompletedLink(
			'jetpack_backup_daily',
			'mysite.wordpress.com',
			null
		);
		expect( response ).toBe( 'https://cloud.jetpack.com/backup/mysite.wordpress.com' );
	} );

	it( 'return link to /scan if a Scan product and a valid site are given', () => {
		const response = getActivationCompletedLink( 'jetpack_scan', 'mysite.wordpress.com', null );
		expect( response ).toBe( 'https://cloud.jetpack.com/scan/mysite.wordpress.com' );
	} );

	it( 'return link to /search if a Search product and a valid site are given', () => {
		const response = getActivationCompletedLink( 'jetpack_search', 'mysite.wordpress.com', null );
		expect( response ).toBe( 'https://cloud.jetpack.com/jetpack-search/mysite.wordpress.com' );
	} );

	it( 'return link to WP Admin for any other product than scan, backup, or search', () => {
		const response = getActivationCompletedLink(
			'jetpack_security_daily',
			'mysite.wordpress.com',
			'https://mysite.jurassic.ninja/wp-admin'
		);
		expect( response ).toBe( 'https://mysite.jurassic.ninja/wp-admin' );
	} );

	it( 'return link to /landing for any other product than scan, backup, or search when WP Admin URL is not valid', () => {
		const response = getActivationCompletedLink( 'jetpack_complete', 'mysite.wordpress.com', null );
		expect( response ).toBe( 'https://cloud.jetpack.com/landing/mysite.wordpress.com' );
	} );
} );
