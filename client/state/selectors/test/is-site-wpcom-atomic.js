/**
 * Internal dependencies
 */
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';

describe( 'isSiteWpcomAtomic()', () => {
	test( 'should default to false', () => {
		expect( isSiteWpcomAtomic( {}, 123 ) ).toBe( false );
	} );

	test( 'should return the correct wpcom atomic field', () => {
		const state = {
			sites: {
				items: {
					[ 123 ]: {
						options: {
							is_wpcom_atomic: true,
						},
					},
				},
			},
		};

		expect( isSiteWpcomAtomic( state, 123 ) ).toBe( true );
	} );
} );
