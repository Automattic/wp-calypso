/**
 * Internal dependencies
 */
import isSiteWhiteGlove from '../is-site-white-glove';

describe( 'isSiteWhiteGlove', () => {
	test( 'returns false if site does not exist', () => {
		const state = { sites: { items: {} } };
		const isWhiteGlove = isSiteWhiteGlove( state, 1 );
		expect( isWhiteGlove ).toBe( false );
	} );

	test( 'returns true if site exists and has is_white_glove true', () => {
		const state = {
			sites: {
				items: {
					123: {
						is_white_glove: true,
					},
				},
			},
		};
		const isWhiteGlove = isSiteWhiteGlove( state, 123 );
		expect( isWhiteGlove ).toBe( true );
	} );

	test( 'returns false if site exists and has is_white_glove false', () => {
		const state = {
			sites: {
				items: {
					123: {
						is_white_glove: false,
					},
				},
			},
		};
		const isWhiteGlove = isSiteWhiteGlove( state, 123 );
		expect( isWhiteGlove ).toBe( false );
	} );

	test( 'returns false if site exists and has no is_white_glove prop', () => {
		const state = {
			sites: {
				items: {
					123: {
						someKey: 'someValue',
					},
				},
			},
		};
		const isWhiteGlove = isSiteWhiteGlove( state, 123 );
		expect( isWhiteGlove ).toBe( false );
	} );
} );
