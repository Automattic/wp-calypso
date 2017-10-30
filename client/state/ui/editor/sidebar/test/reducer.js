/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { EDITOR_NESTED_SIDEBAR_SET } from 'state/action-types';
import reducer, { nestedSidebarTarget } from '../reducer';
import { NESTED_SIDEBAR_NONE } from '../constants';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'nestedSidebarTarget' ] );
	} );

	describe( '#nestedSidebarTarget()', () => {
		test( 'should default to "NESTED_SIDEBAR_NONE"', () => {
			const state = nestedSidebarTarget( undefined, {} );
			expect( state ).to.eql( NESTED_SIDEBAR_NONE );
		} );

		test( 'should update the value of the nested-sidebar target to the passed target', () => {
			const target = 'TEST_TARGET';
			const state = nestedSidebarTarget( undefined, {
				type: EDITOR_NESTED_SIDEBAR_SET,
				target,
			} );

			expect( state ).to.equal( target );
		} );
	} );
} );
