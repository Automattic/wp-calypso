/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { cloneDeep } from 'lodash';

/**
 * Internal dependencies
 */
import { LOADING } from 'woocommerce/state/constants';
import {
	fetchShippingClassesSuccess,
	fetchShippingClasses,
	updateShippingClassSuccess,
	createShippingClassSuccess,
	deleteShippingClassSuccess,
} from '../actions';
import reducer from '../reducers';
import initialState from './data/initial-state';

const siteId = 123;

const dispatchFn = action => action;

const getState = () => ( {
	extensions: {
		woocommerce: {
			sites: {
				[ siteId ]: {
					shippingClasses: false,
				},
			},
		},
	},
} );

describe( 'Shipping classes form reducer', () => {
	const expectedEndState = cloneDeep( initialState );

	afterEach( () => {
		// make sure the state hasn't been mutated
		// after each test
		expect( initialState ).to.eql( expectedEndState );
	} );

	test( 'WOOCOMMERCE_SHIPPING_CLASSES_REQUEST enters loading state', () => {
		const action = fetchShippingClasses( siteId )( dispatchFn, getState );
		const state = reducer( false, action );

		expect( state ).to.equal( LOADING );
	} );

	test( 'WOOCOMMERCE_SHIPPING_CLASSES_REQUEST_SUCCESS saves data', () => {
		const action = fetchShippingClassesSuccess( siteId, initialState );
		const state = reducer( false, action );

		expect( state ).to.eql( initialState );
	} );

	test( 'WOOCOMMERCE_SHIPPING_CLASS_UPDATED replaces an existing class.', () => {
		const data = {
			id: 3,
			name: 'Shipping class 3 (updated)',
		};

		const action = updateShippingClassSuccess( siteId, data );
		const state = reducer( initialState, action );

		expect( state ).to.eql(
			initialState.map( shippingClass => {
				return shippingClass.id === data.id ? data : shippingClass;
			} )
		);
	} );

	test( 'WOOCOMMERCE_SHIPPING_CLASS_CREATED adds the class to the list.', () => {
		const trigger = {
			siteId,
			temporaryId: 'temp-1',
		};

		const data = {
			id: 4,
			name: 'Shipping Class 4',
		};

		const action = createShippingClassSuccess( trigger, data );
		const state = reducer( initialState, action );

		expect( state ).to.eql( [ ...initialState, data ] );
	} );

	test( 'WOOCOMMERCE_SHIPPING_CLASS_DELETED removes a class form the list.', () => {
		const action = deleteShippingClassSuccess( siteId, 2 );
		const state = reducer( initialState, action );

		expect( state ).to.eql( initialState.filter( shippingClass => shippingClass.id !== 2 ) );
	} );
} );
