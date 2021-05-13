/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getCurrentLayoutFocus } from '../../layout-focus/selectors';

describe( 'selectors', () => {
	let state;

	beforeAll( () => {
		state = {
			ui: {
				layoutFocus: {
					current: 'sites',
					next: 'preview',
				},
			},
		};
	} );

	describe( 'getCurrentLayoutFocus', () => {
		test( 'returns the current layout focus area', () => {
			expect( getCurrentLayoutFocus( state ) ).to.equal( 'sites' );
		} );
	} );
} );
