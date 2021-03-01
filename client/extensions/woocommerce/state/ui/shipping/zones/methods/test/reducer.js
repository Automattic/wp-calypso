/**
 * Internal dependencies
 */
import {
	addMethodToShippingZone,
	openShippingZoneMethod,
	cancelShippingZoneMethod,
	removeMethodFromShippingZone,
	changeShippingZoneMethodType,
	changeShippingZoneMethodTitle,
	toggleShippingZoneMethodEnabled,
	toggleOpenedShippingZoneMethodEnabled,
} from '../actions';
import { setShippingCost } from '../flat-rate/actions';
import reducer, { initialState } from '../reducer';
import { WOOCOMMERCE_SHIPPING_ZONE_METHOD_CLOSE } from 'woocommerce/state/action-types';

const siteId = 123;

describe( 'reducer', () => {
	describe( 'addMethodToShippingZone', () => {
		test( 'should create a shipping method in currentlyEditingChanges and mark it as new', () => {
			const newState = reducer(
				initialState,
				addMethodToShippingZone( siteId, 'flat_rate', 'Flat rate' )
			);
			expect( newState.currentlyEditingId ).toEqual( { index: 0 } );
			expect( newState.currentlyEditingNew ).toBe( true );
			expect( newState.creates ).toHaveLength( 0 );
			expect( newState.currentlyEditingChanges.id ).toEqual( { index: 0 } );
			expect( newState.currentlyEditingChanges.methodType ).toBe( 'flat_rate' );
			expect( newState.currentlyEditingChanges.title ).toBe( 'Flat rate' );
			// Check that the method was initialized:
			expect( typeof newState.currentlyEditingChanges.cost ).toBe( 'number' );
		} );
	} );

	describe( 'removeMethodFromShippingZone', () => {
		test( 'should add the method ID to the "deletes" list if it is a server-side ID', () => {
			const newState = reducer( initialState, removeMethodFromShippingZone( siteId, 1 ) );
			expect( newState.creates ).toHaveLength( 0 );
			expect( newState.updates ).toHaveLength( 0 );
			expect( newState.deletes ).toEqual( [ { id: 1 } ] );
		} );

		test( 'should delete any previous "updates" the method had', () => {
			const state = {
				creates: [],
				updates: [ { id: 1, title: 'MyMethod' } ],
				deletes: [],
			};
			const newState = reducer( state, removeMethodFromShippingZone( siteId, 1 ) );
			expect( newState.creates ).toHaveLength( 0 );
			expect( newState.updates ).toHaveLength( 0 );
			expect( newState.deletes ).toEqual( [ { id: 1 } ] );
		} );

		test( 'should remove the method from the "creates" list if it had a provisional ID', () => {
			const state = {
				creates: [ { id: { index: 0 }, title: 'NewMethod' } ],
				updates: [],
				deletes: [],
			};
			const newState = reducer( state, removeMethodFromShippingZone( siteId, { index: 0 } ) );
			expect( newState.creates ).toHaveLength( 0 );
			expect( newState.updates ).toHaveLength( 0 );
			expect( newState.deletes ).toHaveLength( 0 );
		} );
	} );

	describe( 'changeShippingZoneMethodType', () => {
		test( 'should change the type of the currently edited method and mark it as changed', () => {
			const state = {
				creates: [],
				updates: [ { id: 7, methodType: 'free_shipping', title: 'MyMethod' } ],
				deletes: [],
				currentlyEditingId: 7,
				currentlyEditingChanges: {},
				currentlyEditingNew: false,
				currentlyEditingChangedType: false,
			};

			const newState = reducer(
				state,
				changeShippingZoneMethodType( siteId, 'flat_rate', 'Flat rate' )
			);
			expect( newState.currentlyEditingChanges.methodType ).toBe( 'flat_rate' );
			expect( newState.currentlyEditingChanges.title ).toBe( 'Flat rate' );
			expect( newState.currentlyEditingChangedType ).toBe( true );
			expect( newState.currentlyEditingNew ).toBe( false );
		} );

		test( 'should change the type of a newly added method and keep it marked as new', () => {
			const state = {
				creates: [],
				updates: [ { id: 7, methodType: 'free_shipping', title: 'MyMethod' } ],
				deletes: [],
				currentlyEditingId: 7,
				currentlyEditingChanges: {},
				currentlyEditingNew: true,
				currentlyEditingChangedType: false,
			};

			const newState = reducer(
				state,
				changeShippingZoneMethodType( siteId, 'flat_rate', 'Flat rate' )
			);
			expect( newState.currentlyEditingChanges.methodType ).toBe( 'flat_rate' );
			expect( newState.currentlyEditingChanges.title ).toBe( 'Flat rate' );
			expect( newState.currentlyEditingChangedType ).toBe( true );
			expect( newState.currentlyEditingNew ).toBe( true );
		} );
	} );

	describe( 'changeShippingZoneMethodTitle', () => {
		test( 'should change the title of the currently edited method', () => {
			const state = {
				creates: [],
				updates: [ { id: 1, title: 'Trololol' } ],
				deletes: [],
				currentlyEditingId: 7,
				currentlyEditingChanges: {},
			};

			const newState = reducer( state, changeShippingZoneMethodTitle( siteId, 'New Title' ) );
			expect( newState.currentlyEditingChanges ).toEqual( { title: 'New Title' } );
		} );
	} );

	describe( 'edit a shipping zone method property', () => {
		test( 'should change the property on the currently edited zone', () => {
			const state = {
				creates: [],
				updates: [ { id: 1 } ],
				deletes: [],
				currentlyEditingId: 7,
				currentlyEditingChanges: {},
			};

			const newState = reducer( state, setShippingCost( siteId, 1, 42 ) );
			expect( newState.currentlyEditingChanges.cost ).toBe( 42 );
		} );
	} );

	describe( 'openShippingZoneMethod', () => {
		test( 'should mark the method as open and clear any changes', () => {
			const state = {
				creates: [],
				updates: [],
				deletes: [],
				currentlyEditingId: null,
				currentlyEditingChanges: { title: 'New Title' },
			};

			const newState = reducer( state, openShippingZoneMethod( siteId, 1 ) );
			expect( newState.currentlyEditingId ).toBe( 1 );
			expect( newState.currentlyEditingNew ).toBe( false );
			expect( newState.currentlyEditingChangedType ).toBe( false );
			expect( newState.currentlyEditingChanges ).toEqual( {} );
		} );
	} );

	describe( 'cancelShippingZoneMethod', () => {
		test( 'should mark the method as closed', () => {
			const state = {
				creates: [],
				updates: [],
				deletes: [],
				currentlyEditingId: 1,
			};

			const newState = reducer( state, cancelShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).toBeNull();
		} );

		test( 'should discard the changes', () => {
			const state = {
				creates: [],
				updates: [ { id: 1, title: 'Old Title' } ],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: { title: 'New Title' },
			};

			const newState = reducer( state, cancelShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).toBeNull();
			expect( newState.updates[ 0 ].title ).toBe( 'Old Title' );
		} );
	} );

	describe( 'closeShippingZoneMethod', () => {
		// The real closeShippingZoneMethod is a thunk now, but this test is only concerned with the reducer
		const closeShippingZoneMethod = ( _siteId ) => ( {
			type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_CLOSE,
			siteId: _siteId,
		} );

		test( 'should mark the method as closed', () => {
			const state = {
				creates: [],
				updates: [],
				deletes: [],
				currentlyEditingId: 1,
			};

			const newState = reducer( state, closeShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).toBeNull();
		} );

		test( 'method creation - should add the new method to creates and remove the isNew flag', () => {
			const state = {
				creates: [],
				updates: [],
				deletes: [],
				currentlyEditingId: { index: 0 },
				currentlyEditingChanges: { id: { index: 0 }, title: 'abc' },
				currentlyEditingNew: true,
			};

			const newState = reducer( state, closeShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).toBeNull();
			expect( newState.currentlyEditingNew ).toBe( false );
			expect( newState.creates.length ).toBe( 1 );
			expect( newState.creates[ 0 ].id ).toEqual( { index: 0 } );
			expect( newState.creates[ 0 ].title ).toBe( 'abc' );
		} );

		test( 'method type changed - should add the old method to "deletes" and add the new one to "creates" if it had a server-side ID', () => {
			const state = {
				creates: [],
				updates: [ { id: 7, methodType: 'free_shipping', title: 'MyMethod' } ],
				deletes: [],
				currentlyEditingId: 7,
				currentlyEditingChanges: { id: 7, methodType: 'flat_rate', cost: 12 },
				currentlyEditingChangedType: true,
			};

			const newState = reducer( state, closeShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).toBeNull();
			expect( newState.updates ).toHaveLength( 0 );
			expect( newState.deletes ).toEqual( [ { id: 7 } ] );
			expect( newState.creates.length ).toBe( 1 );
			expect( newState.creates[ 0 ].id ).toEqual( { index: 0 } );
			expect( newState.creates[ 0 ].methodType ).toBe( 'flat_rate' );
			expect( newState.creates[ 0 ]._originalId ).toBe( 7 );
			// Check that the method was initialized:
			expect( typeof newState.creates[ 0 ].cost ).toBe( 'number' );
		} );

		test( 'method type changed - should remove the old method from "creates" and replace it with the new one if it had a provisional ID', () => {
			const state = {
				creates: [ { id: { index: 0 }, methodType: 'free_shipping', title: 'MyMethod' } ],
				updates: [],
				deletes: [],
				currentlyEditingId: { index: 0 },
				currentlyEditingChanges: { id: { index: 0 }, methodType: 'flat_rate', cost: 12 },
				currentlyEditingChangedType: true,
			};

			const newState = reducer( state, closeShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).toBeNull();
			expect( newState.updates ).toHaveLength( 0 );
			expect( newState.deletes ).toHaveLength( 0 );
			expect( newState.creates.length ).toBe( 1 );
			expect( newState.creates[ 0 ].id ).toEqual( { index: 0 } );
			expect( newState.creates[ 0 ].methodType ).toBe( 'flat_rate' );
			expect( newState.creates[ 0 ]._originalId ).toEqual( { index: 0 } );
			// Check that the method was initialized:
			expect( typeof newState.creates[ 0 ].cost ).toBe( 'number' );
		} );

		test( 'method type changed - should preserve the _originalId field if the method had already changed type before', () => {
			const state = {
				creates: [ { id: { index: 0 }, methodType: 'free_shipping', _originalId: 7 } ],
				updates: [],
				deletes: [],
				currentlyEditingId: { index: 0 },
				currentlyEditingChanges: { id: { index: 0 }, changedType: true, methodType: 'flat_rate' },
			};

			const newState = reducer( state, closeShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).toBeNull();
			expect( newState.updates ).toHaveLength( 0 );
			expect( newState.deletes ).toHaveLength( 0 );
			expect( newState.creates.length ).toBe( 1 );
			expect( newState.creates[ 0 ].id ).toEqual( { index: 0 } );
			expect( newState.creates[ 0 ].methodType ).toBe( 'flat_rate' );
			expect( newState.creates[ 0 ]._originalId ).toBe( 7 );
		} );

		test( 'title change - should change the entry on "updates" if the method has a server-side ID', () => {
			const state = {
				creates: [],
				updates: [ { id: 1, title: 'Trololol' } ],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: { title: 'New Title' },
			};

			const newState = reducer( state, closeShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).toBeNull();
			expect( newState.creates ).toHaveLength( 0 );
			expect( newState.deletes ).toHaveLength( 0 );
			expect( newState.updates ).toEqual( [ { id: 1, title: 'New Title' } ] );
		} );

		test(
			'title change - should add an entry on "updates" if the method has a server-side ID ' +
				'and it has not been edited',
			() => {
				const state = {
					creates: [],
					updates: [],
					deletes: [],
					currentlyEditingId: 1,
					currentlyEditingChanges: { title: 'New Title' },
				};

				const newState = reducer( state, closeShippingZoneMethod( siteId ) );
				expect( newState.currentlyEditingId ).toBeNull();
				expect( newState.creates ).toHaveLength( 0 );
				expect( newState.deletes ).toHaveLength( 0 );
				expect( newState.updates ).toEqual( [ { id: 1, title: 'New Title' } ] );
			}
		);

		test( 'title change - should change the entry in "creates" if the method has a provisional ID', () => {
			const state = {
				creates: [ { id: { index: 0 }, title: 'Trololol' } ],
				updates: [],
				deletes: [],
				currentlyEditingId: { index: 0 },
				currentlyEditingChanges: { title: 'New Title' },
			};

			const newState = reducer( state, closeShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).toBeNull();
			expect( newState.updates ).toHaveLength( 0 );
			expect( newState.deletes ).toHaveLength( 0 );
			expect( newState.creates ).toEqual( [ { id: { index: 0 }, title: 'New Title' } ] );
		} );

		test( 'property change - should change the entry on "updates" if the method has a server-side ID', () => {
			const state = {
				creates: [],
				updates: [ { id: 1 } ],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: { cost: 42 },
			};

			const newState = reducer( state, closeShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).toBeNull();
			expect( newState.creates ).toHaveLength( 0 );
			expect( newState.deletes ).toHaveLength( 0 );
			expect( newState.updates ).toEqual( [ { id: 1, cost: 42 } ] );
		} );

		test( 'property change - should add an entry on "updates" if the method has a server-side ID and it has not been edited', () => {
			const state = {
				creates: [],
				updates: [],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: { cost: 42 },
			};

			const newState = reducer( state, closeShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).toBeNull();
			expect( newState.creates ).toHaveLength( 0 );
			expect( newState.deletes ).toHaveLength( 0 );
			expect( newState.updates.length ).toBe( 1 );
			expect( newState.updates[ 0 ] ).toMatchObject( { id: 1, cost: 42 } );
		} );

		test( 'property change - should change the entry in "creates" if the method has a provisional ID', () => {
			const state = {
				creates: [ { id: { index: 0 } } ],
				updates: [],
				deletes: [],
				currentlyEditingId: { index: 0 },
				currentlyEditingChanges: { cost: 42 },
			};

			const newState = reducer( state, closeShippingZoneMethod( siteId ) );
			expect( newState.currentlyEditingId ).toBeNull();
			expect( newState.updates ).toHaveLength( 0 );
			expect( newState.deletes ).toHaveLength( 0 );
			expect( newState.creates ).toEqual( [ { id: { index: 0 }, cost: 42 } ] );
		} );
	} );

	describe( 'toggleOpenedShippingZoneMethodEnabled', () => {
		test( 'should change the enabled state on the currently edited method', () => {
			const state = {
				creates: [],
				updates: [],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: { enabled: false },
			};

			const newState = reducer( state, toggleOpenedShippingZoneMethodEnabled( siteId, true ) );
			expect( newState.currentlyEditingChanges.enabled ).toBe( true );
		} );
	} );

	describe( 'toggleShippingZoneMethodEnabled', () => {
		test( 'should change the entry on "updates" if the method has a server-side ID', () => {
			const state = {
				creates: [],
				updates: [ { id: 1, enabled: true } ],
				deletes: [],
			};
			const newState = reducer( state, toggleShippingZoneMethodEnabled( siteId, 1, false ) );
			expect( newState.creates ).toHaveLength( 0 );
			expect( newState.deletes ).toHaveLength( 0 );
			expect( newState.updates ).toEqual( [ { id: 1, enabled: false } ] );
		} );

		test( 'should add an entry on "updates" if the method has a server-side ID and it has not been edited', () => {
			const state = {
				creates: [],
				updates: [],
				deletes: [],
			};
			const newState = reducer( state, toggleShippingZoneMethodEnabled( siteId, 1, true ) );
			expect( newState.creates ).toHaveLength( 0 );
			expect( newState.deletes ).toHaveLength( 0 );
			expect( newState.updates ).toEqual( [ { id: 1, enabled: true } ] );
		} );

		test( 'should change the entry in "creates" if the method has a provisional ID', () => {
			const state = {
				creates: [ { id: { index: 0 }, enabled: false } ],
				updates: [],
				deletes: [],
			};
			const newState = reducer(
				state,
				toggleShippingZoneMethodEnabled( siteId, { index: 0 }, true )
			);
			expect( newState.updates ).toHaveLength( 0 );
			expect( newState.deletes ).toHaveLength( 0 );
			expect( newState.creates ).toEqual( [ { id: { index: 0 }, enabled: true } ] );
		} );
	} );
} );
