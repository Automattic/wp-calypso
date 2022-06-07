import isVipSite from 'calypso/state/selectors/is-vip-site';

describe( 'isVipSite()', () => {
	test( 'returns null if site does not exist', () => {
		const isVip = isVipSite( { sites: { items: { 5: { is_vip: true } } } }, 99999 );
		expect( isVip ).toBeNull();
	} );

	test( 'returns true if is_vip property of the site is true', () => {
		const isVip = isVipSite( { sites: { items: { 5: { is_vip: true } } } }, 5 );
		expect( isVip ).toBe( true );
	} );

	test( 'returns false if is_vip property of the site is false', () => {
		const isVip = isVipSite( { sites: { items: { 5: { is_vip: false } } } }, 5 );
		expect( isVip ).toBe( false );
	} );

	test( 'returns null if is_vip property of the site does not exist', () => {
		const isVip = isVipSite( { sites: { items: { 5: {} } } }, 5 );
		expect( isVip ).toBeNull();
	} );
} );
