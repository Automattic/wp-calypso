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

	before( () => {
		state = { ui: { layoutFocus: {
			current: 'sites',
			next: 'preview',
		} } };
	} );

	describe( 'getCurrentLayoutFocus', () => {
		it( 'returns the current layout focus area', () => {
			expect( getCurrentLayoutFocus( state ) ).to.equal( 'sites' );
		} );
	} );
} );
