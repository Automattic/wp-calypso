import isBlazeEnabled from 'calypso/state/selectors/is-blaze-enabled';

describe( 'isBlazeEnabled()', () => {
	test( 'should return false if no siteId is defined', () => {
		const siteId = null;
		const state = {
			sites: {
				items: {},
			},
		};
		const blazeEnabled = isBlazeEnabled( state, siteId );

		expect( blazeEnabled ).toBe( false );
	} );

	test( 'should return true if siteId is defined', () => {
		const siteId = 123;
		const state = {
			sites: {
				items: {
					[ siteId ]: {
						options: {
							can_blaze: true,
						},
					},
				},
			},
		};
		const blazeEnabled = isBlazeEnabled( state, siteId );

		expect( blazeEnabled ).toBe( true );
	} );
} );
