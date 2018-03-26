/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { setDomainSearchPrefill } from '../actions';

describe( 'actions', () => {
	describe( 'domain search prefill', () => {
		test( 'should have the expected keys "prefill" and "overwrite"', () => {
			const action = setDomainSearchPrefill( 'some search value' );
			expect( action ).to.be.an( 'object' );
			expect( Object.keys( action ) ).to.include( 'prefill', 'overwrite' );
		} );
		test( 'should default the overwrite value to false', () => {
			const action = setDomainSearchPrefill( 'value' );
			expect( action.overwrite ).to.eql( false );
		} );
	} );
} );
