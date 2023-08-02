import getProductSlugFromLicenseKey from '../get-product-slug-from-license-key';

describe( 'getProductSlugFromLicenseKey', () => {
	it.each( [
		[ 'jetpack_backup_t1_yearly_abcdef', 'jetpack_backup_t1_yearly' ],
		[ 'jetpack_security_daily_ghijkl', 'jetpack_security_daily' ],
		[ 'jetpack_security_t1_yearly_mnopqr', 'jetpack_security_t1_yearly' ],
		[ 'a_completely_random_product_slug_stuvwx', 'a_completely_random_product_slug' ],
		[ 'anotherone_yzabcd', 'anotherone' ],
	] )( 'returns the full product slug when it contains underscores', ( key, slug ) => {
		const productSlug = getProductSlugFromLicenseKey( key );
		expect( productSlug ).toBe( slug );
	} );

	it.each( [
		[ 'jetpack-backup-t1-yearly_abcdef', 'jetpack-backup-t1-yearly' ],
		[ 'jetpack-security-daily_ghijkl', 'jetpack-security-daily' ],
		[ 'jetpack-security-t1-yearly_mnopqr', 'jetpack-security-t1-yearly' ],
		[ 'a-completely-random-product-slug_stuvwx', 'a-completely-random-product-slug' ],
		[ 'anotherone_yzabcd', 'anotherone' ],
	] )( 'returns the correct product slug when it contains dashes', ( key, slug ) => {
		const productSlug = getProductSlugFromLicenseKey( key );
		expect( productSlug ).toBe( slug );
	} );

	it( 'returns null if no underscore is present', () => {
		const productSlug = getProductSlugFromLicenseKey( 'whatever-is+here=is/invalid' );
		expect( productSlug ).toBeNull();
	} );

	it.each( [ [ '' ], [ null ], [ undefined ] ] )(
		'returns null when the input is falsy',
		( key ) => {
			const productSlug = getProductSlugFromLicenseKey( key );
			expect( productSlug ).toBeNull();
		}
	);
} );
