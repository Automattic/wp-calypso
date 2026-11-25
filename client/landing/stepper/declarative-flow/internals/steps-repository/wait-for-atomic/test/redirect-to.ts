import { getTransferRedirectTo } from '../redirect-to';

const before = { URL: 'https://shop.example' };
const after = {
	URL: 'https://foo.example',
	options: { unmapped_url: 'https://foo.wpcomstaging.com' },
};

describe( 'getTransferRedirectTo', () => {
	it.each( [ 'javascript:alert(1)', 'https://evil.example/', 'https://foo.wordpress.com.evil/' ] )(
		'drops %s',
		( redirectTo ) => {
			expect( getTransferRedirectTo( redirectTo, before, after ) ).toBeNull();
		}
	);

	it.each( [
		[ 'pre-transfer', 'https://shop.example/wp-admin/' ],
		[ 'post-transfer', 'https://foo.example/wp-admin/' ],
		[ 'staging', 'https://foo.wpcomstaging.com/wp-admin/' ],
	] )( 'follows the site’s %s host', ( _, redirectTo ) => {
		expect( getTransferRedirectTo( redirectTo, before, after ) ).toBe( redirectTo );
	} );

	it( 'follows the site’s former host when a reload left no earlier site', () => {
		const redirectTo = 'https://foo.wordpress.com/wp-admin/admin.php?page=wc-admin';

		expect( getTransferRedirectTo( redirectTo, null, after ) ).toBe( redirectTo );
	} );

	it( 'follows a direct-to-cart partner host', () => {
		const redirectTo = 'https://cloud.jetpack.com/landing';

		expect( getTransferRedirectTo( redirectTo, null, after ) ).toBe( redirectTo );
	} );
} );
