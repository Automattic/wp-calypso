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
			expect( newState.creates[ 0 ].methodType ).to.equal( 'flat_rate' );
			// Check that the method was initialized:
			expect( newState.creates[ 0 ].cost ).to.be.a.number;
		} );
	} );

	describe( 'removeMethodFromShippingZone', () => {
		it( 'should add the method ID to the "deletes" list if it is a server-side ID', () => {
			const newState = reducer( initialState, removeMethodFromShippingZone( siteId, 1 ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.deep.equal( [ { id: 1 } ] );
		} );

		it( 'should delete any previous "updates" the method had', () => {
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

		it( 'should remove the method from the "creates" list if it had a provisional ID', () => {
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
		it( 'should add the old method to "deletes" and add the new one to "creates" if it had a server-side ID', () => {
			const state = {
				creates: [],
				updates: [ { id: 7, methodType: 'free_shipping', title: 'MyMethod' } ],
				deletes: [],
			};

			const newState = reducer( state, changeShippingZoneMethodType( siteId, 7, 'flat_rate' ) );
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.deep.equal( [ { id: 7 } ] );
			expect( newState.creates.length ).to.equal( 1 );
			expect( newState.creates[ 0 ].id ).to.deep.equal( { index: 0 } );
			expect( newState.creates[ 0 ].methodType ).to.equal( 'flat_rate' );
			expect( newState.creates[ 0 ]._originalId ).to.equal( 7 );
			// Check that the method was initialized:
			expect( newState.creates[ 0 ].cost ).to.be.a.number;
		} );

		it( 'should remove the old method from "creates" and replace it with the new one if it had a provisional ID', () => {
			const state = {
				creates: [ { id: { index: 0 }, methodType: 'free_shipping', title: 'MyMethod' } ],
				updates: [],
				deletes: [],
			};

			const newState = reducer( state, changeShippingZoneMethodType( siteId, { index: 0 }, 'flat_rate' ) );
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
			expect( newState.creates.length ).to.equal( 1 );
			expect( newState.creates[ 0 ].id ).to.deep.equal( { index: 0 } );
			expect( newState.creates[ 0 ].methodType ).to.equal( 'flat_rate' );
			expect( newState.creates[ 0 ]._originalId ).to.deep.equal( { index: 0 } );
			// Check that the method was initialized:
			expect( newState.creates[ 0 ].cost ).to.be.a.number;
		} );

		it( 'should preserve the _originalId field if the method had already changed type before', () => {
			const state = {
				creates: [ { id: { index: 0 }, methodType: 'free_shipping', _originalId: 7 } ],
				updates: [],
				deletes: [],
			};

			const newState = reducer( state, changeShippingZoneMethodType( siteId, { index: 0 }, 'flat_rate' ) );
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
			expect( newState.creates.length ).to.equal( 1 );
			expect( newState.creates[ 0 ].id ).to.deep.equal( { index: 0 } );
			expect( newState.creates[ 0 ].methodType ).to.equal( 'flat_rate' );
			expect( newState.creates[ 0 ]._originalId ).to.deep.equal( 7 );
		} );
	} );

	describe( 'changeShippingZoneMethodTitle', () => {
		it( 'should change the entry on "updates" if the method has a server-side ID', () => {
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

		it( 'should add an entry on "updates" if the method has a server-side ID and it has not been edited', () => {
			const state = {
				creates: [],
				updates: [],
				deletes: [],
			};

			const newState = reducer( state, changeShippingZoneMethodTitle( siteId, 1, 'New Title' ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
			expect( newState.updates ).to.deep.equal( [ { id: 1, title: 'New Title' } ] );
		} );

		it( 'should change the entry in "creates" if the method has a provisional ID', () => {
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
		it( 'should change the entry on "updates" if the method has a server-side ID', () => {
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

		it( 'should add an entry on "updates" if the method has a server-side ID and it has not been edited', () => {
			const state = {
				creates: [],
				updates: [],
				deletes: [],
			};

			const newState = reducer( state, setShippingCost( siteId, 1, 42 ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
			expect( newState.updates.length ).to.equal( 1 );
			expect( newState.updates[ 0 ] ).to.deep.include( { id: 1, cost: 42 } );
		} );

		it( 'should change the entry in "creates" if the method has a provisional ID', () => {
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
