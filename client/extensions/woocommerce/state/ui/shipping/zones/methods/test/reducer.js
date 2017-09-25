/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { addMethodToShippingZone, openShippingZoneMethod, cancelShippingZoneMethod, closeShippingZoneMethod, removeMethodFromShippingZone, changeShippingZoneMethodType, changeShippingZoneMethodTitle, toggleShippingZoneMethodEnabled, toggleOpenedShippingZoneMethodEnabled } from '../actions';
import { setShippingCost } from '../flat-rate/actions';
import reducer, { initialState } from '../reducer';

const siteId = 123;

describe( 'reducer', () => {
	describe( 'addMethodToShippingZone', () => {
		it( 'should create a shipping method in currentlyEditingChanges and mark it as new', () => {
			const newState = reducer( initialState, addMethodToShippingZone( siteId, 'flat_rate', 'Flat rate' ) );
			expect( newState.currentlyEditingId ).to.deep.equal( { index: 0 } );
			expect( newState.currentlyEditingNew ).to.equal( true );
			expect( newState.creates.length ).to.equal( 0 );
			expect( newState.currentlyEditingChanges.id ).to.deep.equal( { index: 0 } );
			expect( newState.currentlyEditingChanges.methodType ).to.equal( 'flat_rate' );
			expect( newState.currentlyEditingChanges.title ).to.equal( 'Flat rate' );
			// Check that the method was initialized:
			expect( newState.currentlyEditingChanges.cost ).to.be.a.number;
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
		it( 'should change the type of the currently edited method and mark it as changed', () => {
			const state = {
				creates: [],
				updates: [ { id: 7, methodType: 'free_shipping', title: 'MyMethod' } ],
				deletes: [],
				currentlyEditingId: 7,
				currentlyEditingChanges: {},
				currentlyEditingNew: false,
				currentlyEditingChangedType: false,
			};

			const newState = reducer( state, changeShippingZoneMethodType( siteId, 'flat_rate', 'Flat rate' ) );
			expect( newState.currentlyEditingChanges.methodType ).to.equal( 'flat_rate' );
			expect( newState.currentlyEditingChanges.title ).to.equal( 'Flat rate' );
			expect( newState.currentlyEditingChangedType ).to.equal( true );
			expect( newState.currentlyEditingNew ).to.equal( false );
		} );

		it( 'should change the type of a newly added method and keep it marked as new', () => {
			const state = {
				creates: [],
				updates: [ { id: 7, methodType: 'free_shipping', title: 'MyMethod' } ],
				deletes: [],
				currentlyEditingId: 7,
				currentlyEditingChanges: {},
				currentlyEditingNew: true,
				currentlyEditingChangedType: false,
			};

			const newState = reducer( state, changeShippingZoneMethodType( siteId, 'flat_rate', 'Flat rate' ) );
			expect( newState.currentlyEditingChanges.methodType ).to.equal( 'flat_rate' );
			expect( newState.currentlyEditingChanges.title ).to.equal( 'Flat rate' );
			expect( newState.currentlyEditingChangedType ).to.equal( true );
			expect( newState.currentlyEditingNew ).to.equal( true );
		} );
	} );

	describe( 'changeShippingZoneMethodTitle', () => {
		it( 'should change the title of the currently edited method', () => {
			const state = {
				creates: [],
				updates: [ { id: 1, title: 'Trololol' } ],
				deletes: [],
				currentlyEditingId: 7,
				currentlyEditingChanges: {},
			};

			const newState = reducer( state, changeShippingZoneMethodTitle( siteId, 'New Title' ) );
			expect( newState.currentlyEditingChanges ).to.deep.equal( { title: 'New Title' } );
		} );
	} );

	describe( 'edit a shipping zone method property', () => {
		it( 'should change the property on the currently edited zone', () => {
			const state = {
				creates: [],
				updates: [ { id: 1 } ],
				deletes: [],
				currentlyEditingId: 7,
				currentlyEditingChanges: {},
			};

			const newState = reducer( state, setShippingCost( siteId, 1, 42 ) );
			expect( newState.currentlyEditingChanges.cost ).to.equal( 42 );
		} );
	} );

	describe( 'openShippingZoneMethod', () => {
		it( 'should mark the method as open and clear any changes', () => {
			const state = {
				creates: [],
				updates: [],
				deletes: [],
				currentlyEditingId: null,
				currentlyEditingChanges: { title: 'New Title' }
			};

			const newState = reducer( state, openShippingZoneMethod( siteId, 1 ) );
			expect( newState.currentlyEditingId ).to.equal( 1 );
			expect( newState.currentlyEditingNew ).to.equal( false );
			expect( newState.currentlyEditingChangedType ).to.equal( false );
			expect( newState.currentlyEditingChanges ).to.deep.equal( {} );
		} );
	} );

	describe( 'cancelShippingZoneMethod', () => {
		it( 'should mark the method as closed', () => {
			const state = {
				creates: [],
				updates: [],
				deletes: [],
				currentlyEditingId: 1,
			};

			const newState = reducer( state, cancelShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).to.equal( null );
		} );

		it( 'should discard the changes', () => {
			const state = {
				creates: [],
				updates: [ { id: 1, title: 'Old Title' } ],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: { title: 'New Title' }
			};

			const newState = reducer( state, cancelShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).to.equal( null );
			expect( newState.updates[ 0 ].title ).to.equal( 'Old Title' );
		} );
	} );

	describe( 'closeShippingZoneMethod', () => {
		it( 'should mark the method as closed', () => {
			const state = {
				creates: [],
				updates: [],
				deletes: [],
				currentlyEditingId: 1,
			};

			const newState = reducer( state, closeShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).to.equal( null );
		} );

		it( 'method creation - should add the new method to creates and remove the isNew flag', () => {
			const state = {
				creates: [],
				updates: [],
				deletes: [],
				currentlyEditingId: { index: 0 },
				currentlyEditingChanges: { id: { index: 0 }, title: 'abc' },
				currentlyEditingNew: true,
			};

			const newState = reducer( state, closeShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).to.equal( null );
			expect( newState.currentlyEditingNew ).to.equal( false );
			expect( newState.creates.length ).to.equal( 1 );
			expect( newState.creates[ 0 ].id ).to.deep.equal( { index: 0 } );
			expect( newState.creates[ 0 ].title ).to.equal( 'abc' );
		} );

		it( 'method type changed - should add the old method to "deletes" and add the new one to "creates" ' +
			'if it had a server-side ID', () => {
			const state = {
				creates: [],
				updates: [ { id: 7, methodType: 'free_shipping', title: 'MyMethod' } ],
				deletes: [],
				currentlyEditingId: 7,
				currentlyEditingChanges: { id: 7, methodType: 'flat_rate' },
				currentlyEditingChangedType: true,
			};

			const newState = reducer( state, closeShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).to.equal( null );
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.deep.equal( [ { id: 7 } ] );
			expect( newState.creates.length ).to.equal( 1 );
			expect( newState.creates[ 0 ].id ).to.deep.equal( { index: 0 } );
			expect( newState.creates[ 0 ].methodType ).to.equal( 'flat_rate' );
			expect( newState.creates[ 0 ]._originalId ).to.equal( 7 );
			// Check that the method was initialized:
			expect( newState.creates[ 0 ].cost ).to.be.a.number;
		} );

		it( 'method type changed - should remove the old method from "creates" and replace it with the new one ' +
			'if it had a provisional ID', () => {
			const state = {
				creates: [ { id: { index: 0 }, methodType: 'free_shipping', title: 'MyMethod' } ],
				updates: [],
				deletes: [],
				currentlyEditingId: { index: 0 },
				currentlyEditingChanges: { id: { index: 0 }, methodType: 'flat_rate' },
				currentlyEditingChangedType: true,
			};

			const newState = reducer( state, closeShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).to.equal( null );
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
			expect( newState.creates.length ).to.equal( 1 );
			expect( newState.creates[ 0 ].id ).to.deep.equal( { index: 0 } );
			expect( newState.creates[ 0 ].methodType ).to.equal( 'flat_rate' );
			expect( newState.creates[ 0 ]._originalId ).to.deep.equal( { index: 0 } );
			// Check that the method was initialized:
			expect( newState.creates[ 0 ].cost ).to.be.a.number;
		} );

		it( 'method type changed - should preserve the _originalId field if the method had already changed type before', () => {
			const state = {
				creates: [ { id: { index: 0 }, methodType: 'free_shipping', _originalId: 7 } ],
				updates: [],
				deletes: [],
				currentlyEditingId: { index: 0 },
				currentlyEditingChanges: { id: { index: 0 }, changedType: true, methodType: 'flat_rate' },
			};

			const newState = reducer( state, closeShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).to.equal( null );
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
			expect( newState.creates.length ).to.equal( 1 );
			expect( newState.creates[ 0 ].id ).to.deep.equal( { index: 0 } );
			expect( newState.creates[ 0 ].methodType ).to.equal( 'flat_rate' );
			expect( newState.creates[ 0 ]._originalId ).to.deep.equal( 7 );
		} );

		it( 'title change - should change the entry on "updates" if the method has a server-side ID', () => {
			const state = {
				creates: [],
				updates: [ { id: 1, title: 'Trololol' } ],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: { title: 'New Title' },
			};

			const newState = reducer( state, closeShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).to.equal( null );
			expect( newState.creates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
			expect( newState.updates ).to.deep.equal( [ { id: 1, title: 'New Title' } ] );
		} );

		it( 'title change - should add an entry on "updates" if the method has a server-side ID ' +
			'and it has not been edited', () => {
			const state = {
				creates: [],
				updates: [],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: { title: 'New Title' },
			};

			const newState = reducer( state, closeShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).to.equal( null );
			expect( newState.creates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
			expect( newState.updates ).to.deep.equal( [ { id: 1, title: 'New Title' } ] );
		} );

		it( 'title change - should change the entry in "creates" if the method has a provisional ID', () => {
			const state = {
				creates: [ { id: { index: 0 }, title: 'Trololol' } ],
				updates: [],
				deletes: [],
				currentlyEditingId: { index: 0 },
				currentlyEditingChanges: { title: 'New Title' },
			};

			const newState = reducer( state, closeShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).to.equal( null );
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
			expect( newState.creates ).to.deep.equal( [ { id: { index: 0 }, title: 'New Title' } ] );
		} );

		it( 'property change - should change the entry on "updates" if the method has a server-side ID', () => {
			const state = {
				creates: [],
				updates: [ { id: 1 } ],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: { cost: 42 },
			};

			const newState = reducer( state, closeShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).to.equal( null );
			expect( newState.creates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
			expect( newState.updates ).to.deep.equal( [ { id: 1, cost: 42 } ] );
		} );

		it( 'property change - should add an entry on "updates" if the method has a server-side ID and it has not been edited', () => {
			const state = {
				creates: [],
				updates: [],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: { cost: 42 },
			};

			const newState = reducer( state, closeShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).to.equal( null );
			expect( newState.creates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
			expect( newState.updates.length ).to.equal( 1 );
			expect( newState.updates[ 0 ] ).to.deep.include( { id: 1, cost: 42 } );
		} );

		it( 'property change - should change the entry in "creates" if the method has a provisional ID', () => {
			const state = {
				creates: [ { id: { index: 0 } } ],
				updates: [],
				deletes: [],
				currentlyEditingId: { index: 0 },
				currentlyEditingChanges: { cost: 42 },
			};

			const newState = reducer( state, closeShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).to.equal( null );
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
			expect( newState.creates ).to.deep.equal( [ { id: { index: 0 }, cost: 42 } ] );
		} );
	} );

	describe( 'toggleOpenedShippingZoneMethodEnabled', () => {
		it( 'should change the enabled state on the currently edited method', () => {
			const state = {
				creates: [],
				updates: [],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: { enabled: false },
			};

			const newState = reducer( state, toggleOpenedShippingZoneMethodEnabled( siteId, true ) );
			expect( newState.currentlyEditingChanges.enabled ).to.equal( true );
		} );
	} );

	describe( 'toggleShippingZoneMethodEnabled', () => {
		it( 'should change the entry on "updates" if the method has a server-side ID', () => {
			const state = {
				creates: [],
				updates: [ { id: 1, enabled: true } ],
				deletes: [],
			};
			const newState = reducer( state, toggleShippingZoneMethodEnabled( siteId, 1, false ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
			expect( newState.updates ).to.deep.equal( [ { id: 1, enabled: false } ] );
		} );

		it( 'should add an entry on "updates" if the method has a server-side ID and it has not been edited', () => {
			const state = {
				creates: [],
				updates: [],
				deletes: [],
			};
			const newState = reducer( state, toggleShippingZoneMethodEnabled( siteId, 1, true ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
			expect( newState.updates ).to.deep.equal( [ { id: 1, enabled: true } ] );
		} );

		it( 'should change the entry in "creates" if the method has a provisional ID', () => {
			const state = {
				creates: [ { id: { index: 0 }, enabled: false } ],
				updates: [],
				deletes: [],
			};
			const newState = reducer( state, toggleShippingZoneMethodEnabled( siteId, { index: 0 }, true ) );
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
			expect( newState.creates ).to.deep.equal( [ { id: { index: 0 }, enabled: true } ] );
		} );
	} );
} );
