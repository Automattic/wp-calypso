import isManualSeoAvailable from '../is-manual-seo-available';

describe( 'isManualSeoAvailable', () => {
	test.each( [
		[ 'Simple without an entitlement', { jetpack: false }, undefined, true ],
		[ 'self-hosted with SEO Tools', { jetpack: true }, { available: true }, true ],
		[
			'Atomic with SEO Tools',
			{ jetpack: true, options: { is_wpcom_atomic: true } },
			{ available: true },
			true,
		],
		[ 'SEO Tools switched off', { jetpack: true }, { available: true, active: false }, true ],
		[ 'module unavailable', { jetpack: true }, { available: false }, false ],
		[ 'module data not loaded', { jetpack: true }, undefined, false ],
		[ 'VIP site', { jetpack: false, is_vip: true }, undefined, false ],
		[ 'site not loaded', undefined, undefined, false ],
	] )( '%s', ( _label, site, module, expected ) => {
		const state = {
			sites: { items: site ? { 123: { ID: 123, ...site } } : {} },
			jetpack: { modules: { items: { 123: { 'seo-tools': module } } } },
		};

		expect( isManualSeoAvailable( state, 123 ) ).toBe( expected );
	} );
} );
