/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	FIRST_VIEW_HIDE,
	ROUTE_SET,
	SERIALIZE
} from 'state/action-types';
import {
	firstView
} from '../reducer';

describe( 'reducer', () => {
	describe( 'FIRST_VIEW_HIDE', () => {
		it( 'should hide the first view', () => {
			const state = firstView( {
				hidden: []
			}, { type: FIRST_VIEW_HIDE, view: 'stats' } );

			expect( state ).to.eql( { hidden: [ 'stats' ] } );
		} );

		it( 'should be an idempotent operation when a first view gets hidden', () => {
			const state = firstView( {
				hidden: [ 'stats' ]
			}, { type: FIRST_VIEW_HIDE, view: 'stats' } );

			expect( state ).to.eql( { hidden: [ 'stats' ] } );
		} );

		it( 'should unhide the first view when a new route is set', () => {
			const state = firstView( {
				hidden: [ 'stats' ]
			}, { type: ROUTE_SET } );

			expect( state ).to.eql( { hidden: [] } );
		} );

		it( 'should default to the initial state', () => {
			const state = firstView( undefined, {} );

			expect( state ).to.eql( { hidden: [] } );
		} );

		it( 'should return the original state for irrelevant actions', () => {
			const state = firstView( {
				hidden: [ 'stats' ]
			}, { type: SERIALIZE } );

			expect( state ).to.eql( { hidden: [ 'stats' ] } );
		} );
	} );
} );
