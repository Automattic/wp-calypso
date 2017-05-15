/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import {
	addShippingZone,
	editShippingZone,
	cancelEditingShippingZone,
	closeEditingShippingZone,
	removeShippingZone,
	addLocationToShippingZone,
	removeLocationFromShippingZone,
	addShippingMethod,
	changeShippingMethodType,
	editShippingMethod,
	removeShippingMethod,
} from '../actions';

describe( 'reducer', () => {
	it( 'should initialize to empty state', () => {
		const result = reducer( undefined, { type: '@@test/INIT' } );
		expect( result ).to.be.an( 'object' );
		expect( result ).to.be.empty;
	} );

	it( 'should create an empty zone and start editing it', () => {
		const initialState = { zones: [] };
		const result = reducer( initialState, addShippingZone() );
		expect( result.currentlyEditingZone ).to.deep.equal( {
			id: null,
			locations: [],
			methods: [],
			order: 1,
		} );
		expect( result.zones ).to.be.empty;
	} );

	it( 'should start editing a shipping zone', () => {
		const initialState = { zones: [ { id: 1 } ] };
		const result = reducer( initialState, editShippingZone( 0 ) );
		expect( result.currentlyEditingZone ).to.deep.equal( initialState.zones[ 0 ] );
		expect( result.currentlyEditingZoneIndex ).to.equal( 0 );
	} );

	it( 'should remove a shipping zone', () => {
		const initialState = { zones: [
			{ id: 1 },
			{ id: 2 },
		] };
		const result = reducer( initialState, removeShippingZone( 1 ) );
		expect( result.zones ).to.deep.equal( [ { id: 1 } ] );
	} );

	it( 'should remove the shipping zone currently being edited', () => {
		const initialState = {
			zones: [
				{ id: 1 },
				{ id: 2 },
			],
			currentlyEditingZone: { id: 2 },
			currentlyEditingZoneIndex: 1,
		};
		const result = reducer( initialState, removeShippingZone( 1 ) );
		expect( result.zones ).to.deep.equal( [ { id: 1 } ] );
		expect( result.currentlyEditingZone ).to.be.null;
	} );

	it( 'should cancel editing the zone currently being edited', () => {
		const initialState = {
			zones: [ { id: 1 } ],
			currentlyEditingZone: { id: 1 },
		};
		const result = reducer( initialState, cancelEditingShippingZone() );
		expect( result.zones ).to.deep.equal( initialState.zones );
		expect( result.currentlyEditingZone ).to.be.null;
	} );

	it( 'should close the zone currently being edited, saving it to the zones state', () => {
		const initialState = {
			zones: [ { id: 1 } ],
			currentlyEditingZone: { id: 1, foo: 'bar' },
			currentlyEditingZoneIndex: 0,
		};
		const result = reducer( initialState, closeEditingShippingZone() );
		expect( result.zones.length ).to.equal( 1 );
		expect( result.zones[ 0 ] ).to.deep.equal( initialState.currentlyEditingZone );
		expect( result.currentlyEditingZone ).to.be.null;
	} );

	it( 'should close the zone currently being added, adding it to the zones state', () => {
		const initialState = {
			zones: [],
			currentlyEditingZone: { foo: 'bar' },
			currentlyEditingZoneIndex: -1,
		};
		const result = reducer( initialState, closeEditingShippingZone() );
		expect( result.zones.length ).to.equal( 1 );
		expect( result.zones[ 0 ] ).to.deep.equal( initialState.currentlyEditingZone );
		expect( result.currentlyEditingZone ).to.be.null;
	} );

	it( 'should add a location to the shipping zone being edited', () => {
		const initialState = {
			zones: [],
			currentlyEditingZone: { locations: [] },
		};
		const result = reducer( initialState, addLocationToShippingZone( 'country', 'US' ) );
		expect( result.currentlyEditingZone.locations ).to.deep.equal( [ { type: 'country', code: 'US' } ] );
	} );

	it( 'should not add a repeated location', () => {
		const initialState = {
			zones: [],
			currentlyEditingZone: { locations: [ { type: 'country', code: 'US' } ] },
		};
		const result = reducer( initialState, addLocationToShippingZone( 'country', 'US' ) );
		expect( result ).to.deep.equal( initialState );
	} );

	it( 'should remove a location from the shipping zone being edited', () => {
		const initialState = {
			zones: [],
			currentlyEditingZone: { locations: [ { type: 'country', code: 'US' } ] },
		};
		const result = reducer( initialState, removeLocationFromShippingZone( 'country', 'US' ) );
		expect( result.currentlyEditingZone.locations ).to.be.empty;
	} );

	it( 'should add a shipping method to the zone being edited', () => {
		const initialState = {
			zones: [],
			currentlyEditingZone: { methods: [] },
			methodDefinitions: [
				{ id: 'local_pickup' },
			]
		};
		const result = reducer( initialState, addShippingMethod() );
		expect( result.currentlyEditingZone.methods.length ).to.equal( 1 );
		expect( result.currentlyEditingZone.methods[ 0 ] ).to.deep.equal( {
			id: null,
			order: 1,
			method_id: 'local_pickup',
		} );
	} );

	it( 'should change a shipping method type', () => {
		const initialState = {
			zones: [],
			currentlyEditingZone: { methods: [
				{
					id: null,
					order: 2,
					method_id: 'free_shipping',
					foo: 'bar',
				},
			] },
			methodDefinitions: [
				{ id: 'local_pickup' },
				{ id: 'free_shipping' },
			]
		};
		const result = reducer( initialState, changeShippingMethodType( 0, 'local_pickup' ) );
		expect( result.currentlyEditingZone.methods.length ).to.equal( 1 );
		expect( result.currentlyEditingZone.methods[ 0 ] ).to.deep.equal( {
			id: null,
			order: 2,
			method_id: 'local_pickup',
		} );
	} );

	it( 'should change a value of a shipping method', () => {
		const initialState = {
			zones: [],
			currentlyEditingZone: { methods: [
				{ id: 'free_shipping', foo: '___' },
			] },
			methodDefinitions: [
				{ id: 'free_shipping' },
			]
		};
		const result = reducer( initialState, editShippingMethod( 0, 'foo', 'bar' ) );
		expect( result.currentlyEditingZone.methods ).to.deep.equal( [ { id: 'free_shipping', foo: 'bar' } ] );
	} );

	it( 'should remove a shipping method from the zone being edited', () => {
		const initialState = {
			zones: [],
			currentlyEditingZone: { methods: [
				{ id: 'free_shipping' },
				{ id: 'local_pickup' },
			] },
			methodDefinitions: [
				{ id: 'free_shipping' },
				{ id: 'local_pickup' },
			]
		};
		const result = reducer( initialState, removeShippingMethod( 0 ) );
		expect( result.currentlyEditingZone.methods ).to.deep.equal( [ { id: 'local_pickup' } ] );
	} );
} );
