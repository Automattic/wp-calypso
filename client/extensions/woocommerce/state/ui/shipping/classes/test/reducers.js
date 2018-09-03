/** @format */

/**
 * External dependencies
 */
import { expect, assert } from 'chai';
import { cloneDeep } from 'lodash';

/**
 * Internal dependencies
 */
import {
	editShippingClass,
	closeShippingClass,
	addShippingClass,
	updateShippingClassSetting,
	saveCurrentlyOpenShippingClass,
	removeShippingClass,
} from '../actions';
import {
	updateShippingClassSuccess,
	createShippingClassSuccess,
	deleteShippingClassSuccess,
} from 'woocommerce/state/sites/shipping-classes/actions';
import reducer from '../reducer';

const siteId = 123;
const classId = 999;

const initialState = {
	editing: false,
	editingClass: null,
	changes: {},
	created: [],
	deleted: [],
	updates: [],
};

describe( 'Shipping classes UI reducer', () => {
	const expectedEndState = cloneDeep( initialState );

	afterEach( () => {
		// make sure the state hasn't been mutated
		// after each test
		expect( initialState ).to.eql( expectedEndState );
	} );

	test( 'WOOCOMMERCE_SHIPPING_CLASS_ADD', () => {
		const action = addShippingClass( siteId );
		const state = reducer( initialState, action );

		expect( state.editing ).to.equal( true );
		expect( state.editingClass ).to.equal( null );
		expect( state.changes ).to.eql( {} );
	} );

	test( 'WOOCOMMERCE_SHIPPING_CLASS_EDIT', () => {
		const action = editShippingClass( siteId, classId );
		const state = reducer( initialState, action );

		expect( state.editing ).to.equal( true );
		expect( state.editingClass ).to.equal( classId );
		expect( state.changes ).to.eql( {} );
	} );

	test( 'WOOCOMMERCE_SHIPPING_CLASS_CLOSE', () => {
		const action = closeShippingClass( siteId );
		const state = reducer( initialState, action );

		expect( state.editing ).to.equal( false );
		expect( state.editingClass ).to.equal( null );
		expect( state.changes ).to.eql( {} );
	} );

	test( 'WOOCOMMERCE_SHIPPING_CLASS_CHANGE', () => {
		const name = 'Shipping Class 123';
		const action = updateShippingClassSetting( siteId, 'name', name );
		const state = reducer( initialState, action );

		expect( state.changes.name ).to.equal( name );
	} );

	test( 'WOOCOMMERCE_SHIPPING_CLASS_SAVE for a new class', () => {
		const action = saveCurrentlyOpenShippingClass( siteId );
		const name = 'Shipping Class 123';
		const slug = 'shipping-class-123';

		const state = reducer(
			{
				...initialState,
				editing: true,
				changes: {
					name,
					slug,
				},
			},
			action
		);

		expect( state.editing ).to.equal( false );
		expect( state.changes ).to.eql( {} );
		expect( state.created ).to.have.members( [ state.created[ 0 ] ] );
		expect( state.updates ).to.have.deep.members( [
			{
				id: state.created[ 0 ],
				name,
				slug,
			},
		] );
	} );

	test( 'WOOCOMMERCE_SHIPPING_CLASS_SAVE for an existing class', () => {
		const action = saveCurrentlyOpenShippingClass( siteId );
		const name = 'Shipping Class 123';

		const state = reducer(
			{
				...initialState,
				editing: true,
				editingClass: 1,
				changes: { name },
			},
			action
		);

		expect( state.editing ).to.equal( false );
		expect( state.changes ).to.eql( {} );
		expect( state.updates ).to.have.deep.members( [
			{
				id: 1,
				name,
			},
		] );
	} );

	test( 'WOOCOMMERCE_SHIPPING_CLASS_REMOVE', () => {
		const action = removeShippingClass( siteId, classId );
		const state = reducer( initialState, action );

		expect( state.deleted ).to.have.members( [ classId ] );
		expect( state.editing ).to.equal( false );
		expect( state.changes ).to.eql( {} );
	} );

	test( 'WOOCOMMERCE_SHIPPING_CLASS_UPDATED', () => {
		const action = updateShippingClassSuccess( siteId, { id: classId } );
		const state = reducer(
			{
				...initialState,
				updates: [
					{
						id: classId,
						name: 'Some new name',
					},
				],
			},
			action
		);

		assert.isEmpty( state.updates );
	} );

	test( 'WOOCOMMERCE_SHIPPING_CLASS_CREATED', () => {
		const temporaryId = 'temp-123';
		const data = {
			id: classId,
			name: 'A new class',
			slug: 'a-new-class',
		};

		const action = createShippingClassSuccess( { siteId, temporaryId }, data );
		const state = reducer(
			{
				...initialState,
				created: [ temporaryId ],
				changes: [
					{
						id: temporaryId,
						name: 'A new class',
					},
				],
			},
			action
		);

		assert.isEmpty( state.updates );
		assert.isEmpty( state.created );
	} );

	test( 'WOOCOMMERCE_SHIPPING_CLASS_DELETED', () => {
		const action = deleteShippingClassSuccess( siteId, classId );
		const state = reducer(
			{
				...initialState,
				deleted: [ classId ],
				updates: [
					{
						id: classId,
						name: 'A new name',
					},
				],
			},
			action
		);

		assert.isEmpty( state.deleted );
		assert.isEmpty( state.updates );
	} );
} );
