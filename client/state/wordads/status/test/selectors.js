import { isSiteWordadsUnsafe } from '../selectors';

describe( 'selectors', () => {
	const state = {
		wordads: {
			status: {
				2916284: {
					unsafe: 'mature',
					active: true,
				},
				77203074: {},
			},
		},
	};
	describe( '#isSiteWordadsUnsafe()', () => {
		test( 'should return status value for a given site ID', () => {
			expect( isSiteWordadsUnsafe( state, 2916284 ) ).toEqual( 'mature' );
		} );
		test( 'should return false when sticker absent', () => {
			expect( isSiteWordadsUnsafe( state, 77203074 ) ).toEqual( false );
		} );
		test( 'should return false when site absent', () => {
			expect( isSiteWordadsUnsafe( state, 123 ) ).toEqual( false );
		} );
	} );
} );
