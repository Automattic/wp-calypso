/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer, { initialState } from '../reducer';
import {
	addMethodToShippingZone,
	removeMethodFromShippingZone,
	changeShippingZoneMethodType,
	changeShippingZoneMethodTitle,
} from '../actions';
import { setShippingCost } from '../flat-rate/actions';

const siteId = 123;

describe( 'reducer', () => {
	describe( 'addMethodToShippingZone', () => {
		it( 'should add the shipping method to the "creates" bucket', () => {
			const newState = reducer( initialState, addMethodToShippingZone( siteId, 'flat_rate' ) );
			expect( newState.creates.length ).to.equal( 1 );
			expect( newState.creates[ 0 ].id ).to.deep.equal( { index: 0 } );
			expect( newState.creates[ 0 ].method_id ).to.equal( 'flat_rate' );
			// Check that the method was initialized:
			expect( newState.creates[ 0 ].cost ).to.be.a.number;
		} );
	} );

	describe( 'removeMethodFromShippingZone', () => {
		it( 'when the method has a server-side ID', () => {
			const newState = reducer( initialState, removeMethodFromShippingZone( siteId, 1 ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.deep.equal( [ { id: 1 } ] );
		} );

		it( 'when the method has a server-side ID and it had previous edits', () => {
			const state = {
				creates: [],
				updates: [ { id: 1, title: 'MyMethod' } ],
				deletes: [],
			};
			const newState = reducer( state, removeMethodFromShippingZone( siteId, 1 ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.deep.equal( [ { id: 1 } ] );
		} );

		it( 'when the method has a provisional ID', () => {
			const state = {
				creates: [ { id: { index: 0 }, title: 'NewMethod' } ],
				updates: [],
				deletes: [],
			};
			const newState = reducer( state, removeMethodFromShippingZone( siteId, { index: 0 } ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
		} );
	} );

	describe( 'changeShippingZoneMethodType', () => {
		it( 'when the method has a server-side ID', () => {
			const state = {
				creates: [],
				updates: [ { id: 7, method_id: 'free_shipping', title: 'MyMethod' } ],
				deletes: [],
			};

			const newState = reducer( state, changeShippingZoneMethodType( siteId, 7, 'flat_rate' ) );
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.deep.equal( [ { id: 7 } ] );
			expect( newState.creates.length ).to.equal( 1 );
			expect( newState.creates[ 0 ].id ).to.deep.equal( { index: 0 } );
			expect( newState.creates[ 0 ].method_id ).to.equal( 'flat_rate' );
			expect( newState.creates[ 0 ]._originalId ).to.equal( 7 );
			// Check that the method was initialized:
			expect( newState.creates[ 0 ].cost ).to.be.a.number;
		} );

		it( 'when the method has a provisional ID', () => {
			const state = {
				creates: [ { id: { index: 0 }, method_id: 'free_shipping', title: 'MyMethod' } ],
				updates: [],
				deletes: [],
			};

			const newState = reducer( state, changeShippingZoneMethodType( siteId, { index: 0 }, 'flat_rate' ) );
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
			expect( newState.creates.length ).to.equal( 1 );
			expect( newState.creates[ 0 ].id ).to.deep.equal( { index: 0 } );
			expect( newState.creates[ 0 ].method_id ).to.equal( 'flat_rate' );
			expect( newState.creates[ 0 ]._originalId ).to.deep.equal( { index: 0 } );
			// Check that the method was initialized:
			expect( newState.creates[ 0 ].cost ).to.be.a.number;
		} );

		it( 'when the method already had been changed type', () => {
			const state = {
				creates: [ { id: { index: 0 }, method_id: 'free_shipping', _originalId: 7 } ],
				updates: [],
				deletes: [],
			};

			const newState = reducer( state, changeShippingZoneMethodType( siteId, { index: 0 }, 'flat_rate' ) );
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
			expect( newState.creates.length ).to.equal( 1 );
			expect( newState.creates[ 0 ].id ).to.deep.equal( { index: 0 } );
			expect( newState.creates[ 0 ].method_id ).to.equal( 'flat_rate' );
			expect( newState.creates[ 0 ]._originalId ).to.deep.equal( 7 );
		} );
	} );

	describe( 'changeShippingZoneMethodTitle', () => {
		it( 'when the method has a server-side ID', () => {
			const state = {
				creates: [],
				updates: [ { id: 1, title: 'Trololol' } ],
				deletes: [],
			};

			const newState = reducer( state, changeShippingZoneMethodTitle( siteId, 1, 'New Title' ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
			expect( newState.updates ).to.deep.equal( [ { id: 1, title: 'New Title' } ] );
		} );

		it( 'when the method has a provisional ID', () => {
			const state = {
				creates: [ { id: { index: 0 }, title: 'Trololol' } ],
				updates: [],
				deletes: [],
			};

			const newState = reducer( state, changeShippingZoneMethodTitle( siteId, { index: 0 }, 'New Title' ) );
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
			expect( newState.creates ).to.deep.equal( [ { id: { index: 0 }, title: 'New Title' } ] );
		} );
	} );

	describe( 'edit a shipping zone method property', () => {
		it( 'when the method has a server-side ID', () => {
			const state = {
				creates: [],
				updates: [ { id: 1 } ],
				deletes: [],
			};

			const newState = reducer( state, setShippingCost( siteId, 1, 42 ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
			expect( newState.updates ).to.deep.equal( [ { id: 1, cost: 42 } ] );
		} );

		it( 'when the method has a provisional ID', () => {
			const state = {
				creates: [ { id: { index: 0 } } ],
				updates: [],
				deletes: [],
			};

			const newState = reducer( state, setShippingCost( siteId, { index: 0 }, 42 ) );
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
			expect( newState.creates ).to.deep.equal( [ { id: { index: 0 }, cost: 42 } ] );
		} );
	} );
} );
