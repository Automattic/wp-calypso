/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getNestedSidebarTarget } from '../selectors';

describe( 'selectors', () => {
	describe( '#getNestedSidebarTarget()', () => {
		test( 'should return the state value of the nestedSidebarTarget', () => {
			const target = 'TEST_TARGET';
			const state = {
				ui: { editor: { sidebar: { nestedSidebarTarget: target } } },
			};
			const actual = getNestedSidebarTarget( state );
			const expected = target;

			expect( actual ).to.eql( expected );
		} );
	} );
} );
