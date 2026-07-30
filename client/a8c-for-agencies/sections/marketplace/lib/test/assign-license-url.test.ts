import {
	getAutoAssignLicenseUrl,
	getManualAssignLicenseUrl,
	isFromSitesDashboard,
} from '../assign-license-url';

describe( 'getAutoAssignLicenseUrl', () => {
	it( 'leaves `:receiptId` unescaped so the pending page can interpolate it', () => {
		expect( getAutoAssignLicenseUrl( 123, 'jetpack-boost' ) ).toBe(
			'/purchases/licenses?site_id=123&product_slug=jetpack-boost&receipt_id=:receiptId'
		);
	} );
} );

describe( 'getManualAssignLicenseUrl', () => {
	it( 'carries the license key the manual page pre-fills', () => {
		expect( getManualAssignLicenseUrl( 'jetpack-boost_abc', 123 ) ).toBe(
			'/marketplace/assign-license?key=jetpack-boost_abc&site_id=123&source=sitesdashboard'
		);
	} );

	// The manual page reads this back to decide between /sites and /purchases/licenses. It used to
	// compare against the partner portal's `dashboard`, which this URL never matches.
	it( 'emits a source the manual page recognises', () => {
		expect( isFromSitesDashboard( getManualAssignLicenseUrl( 'jetpack-boost_abc', 123 ) ) ).toBe(
			true
		);
	} );
} );

describe( 'isFromSitesDashboard', () => {
	it( 'rejects a URL with no source', () => {
		expect( isFromSitesDashboard( '/marketplace/assign-license?key=jetpack-boost_abc' ) ).toBe(
			false
		);
	} );

	it( 'rejects the partner portal spelling', () => {
		expect( isFromSitesDashboard( '/marketplace/assign-license?source=dashboard' ) ).toBe( false );
	} );
} );
