/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_CLASSES_REQUEST,
	WOOCOMMERCE_SHIPPING_CLASSES_REQUEST_SUCCESS,
	WOOCOMMERCE_SHIPPING_CLASS_DELETE,
	WOOCOMMERCE_SHIPPING_CLASS_DELETED,
	WOOCOMMERCE_SHIPPING_CLASS_UPDATE,
	WOOCOMMERCE_SHIPPING_CLASS_UPDATED,
	WOOCOMMERCE_SHIPPING_CLASS_CREATE,
	WOOCOMMERCE_SHIPPING_CLASS_CREATED,
} from './../../../action-types';
import {
	fetchShippingClassesSuccess,
	fetchShippingClassesFailure,
	fetchShippingClasses,
	updateShippingClass,
	updateShippingClassSuccess,
	updateShippingClassFailure,
	createShippingClass,
	createShippingClassSuccess,
	createShippingClassFailure,
	deleteShippingClass,
	deleteShippingClassSuccess,
	deleteShippingClassFailure,
} from '../actions';
import initialShippingClasses from './data/initial-state';

const siteId = 123;

const dispatchFn = action => action;
const getState = ( shippingClasses = initialShippingClasses ) => () => ( {
	extensions: {
		woocommerce: {
			sites: {
				[ siteId ]: {
					shippingClasses,
				},
			},
		},
	},
} );
const successCallback = () => {};
const failureCallback = () => {};

const expectErrorNotice = result => {
	expect( result ).to.be.an( 'object' );
	expect( result.type ).to.equal( 'NOTICE_CREATE' );
	expect( result.notice ).to.be.an( 'object' );
};

describe( 'Shipping classes state actions', () => {
	/**
	 * fetchShippingClassesSuccess
	 */

	test( '#fetchShippingClassesSuccess', () => {
		expect( fetchShippingClassesSuccess( siteId, initialShippingClasses ) ).to.eql( {
			type: WOOCOMMERCE_SHIPPING_CLASSES_REQUEST_SUCCESS,
			siteId,
			data: initialShippingClasses,
		} );
	} );

	/**
	 * fetchShippingClassesFailure
	 */

	test( '#fetchShippingClassesFailure', () => {
		const result = fetchShippingClassesFailure( { siteId }, '', dispatchFn );

		expect( result ).to.be.an( 'object' );
		expect( result.type ).to.equal( 'NOTICE_CREATE' );
		expect( result.notice ).to.be.an( 'object' );
	} );

	/**
	 * fetchShippingClasses
	 */

	test( '#fetchShippingClasses', () => {
		expect( fetchShippingClasses( siteId )( dispatchFn, getState( false ) ) ).to.eql( {
			type: WOOCOMMERCE_SHIPPING_CLASSES_REQUEST,
			siteId,
		} );
	} );

	test( '#fetchShippingClasses when classes have been already loaded', () => {
		expect( fetchShippingClasses( siteId )( dispatchFn, getState() ) ).to.equal( undefined );
	} );

	/**
	 * updateShippingClass
	 */
	test( '#updateShippingClass', () => {
		const id = 3;
		const changes = {
			name: 'Shipping class 3 (updated)',
		};

		const result = updateShippingClass( siteId, id, changes, successCallback, failureCallback );

		expect( result ).to.eql( {
			type: WOOCOMMERCE_SHIPPING_CLASS_UPDATE,
			siteId,
			id,
			changes,
			successCallback,
			failureCallback,
		} );
	} );

	/**
	 * updateShippingClassSuccess
	 */

	test( '#updateShippingClassSuccess', () => {
		const data = {
			dummy: true,
		};

		const result = updateShippingClassSuccess( siteId, data );

		expect( result ).to.eql( {
			type: WOOCOMMERCE_SHIPPING_CLASS_UPDATED,
			siteId,
			data,
		} );
	} );

	/**
	 * updateShippingClassFailure
	 */

	test( '#updateShippingClassFailure', () => {
		const result = updateShippingClassFailure();

		expectErrorNotice( result );
	} );

	/**
	 * createShippingClass
	 */

	test( '#createShippingClass', () => {
		const temporaryId = 'temp-123';
		const data = {
			name: 'Shipping Class 123',
		};

		const result = createShippingClass(
			siteId,
			temporaryId,
			data,
			successCallback,
			failureCallback
		);

		expect( result ).to.eql( {
			type: WOOCOMMERCE_SHIPPING_CLASS_CREATE,
			siteId,
			data,
			successCallback,
			failureCallback,
			temporaryId,
		} );
	} );

	/**
	 * createShippingClassSuccess
	 */

	test( '#createShippingClassSuccess', () => {
		const temporaryId = 'temp-123';

		const action = {
			siteId,
			temporaryId,
		};

		const data = {
			dummy: true,
		};

		const result = createShippingClassSuccess( action, data );

		expect( result ).to.eql( {
			type: WOOCOMMERCE_SHIPPING_CLASS_CREATED,
			siteId,
			data,
			temporaryId,
		} );
	} );

	/**
	 * createShippingClassFailure
	 */

	test( '#createShippingClassFailure', () => {
		const result = createShippingClassFailure();
		expectErrorNotice( result );
	} );

	/**
	 * deleteShippingClass
	 */

	test( '#deleteShippingClass', () => {
		const classId = 123;

		const result = deleteShippingClass( siteId, classId, successCallback, failureCallback );

		expect( result ).to.eql( {
			type: WOOCOMMERCE_SHIPPING_CLASS_DELETE,
			siteId,
			classId,
			successCallback,
			failureCallback,
		} );
	} );

	/**
	 * deleteShippingClassSuccess
	 */

	test( '#deleteShippingClassSuccess', () => {
		const classId = 123;
		const result = deleteShippingClassSuccess( siteId, classId );

		expect( result ).to.eql( {
			type: WOOCOMMERCE_SHIPPING_CLASS_DELETED,
			siteId,
			classId,
		} );
	} );

	/**
	 * deleteShippingClassFailure
	 */

	test( '#deleteShippingClassFailure', () => {
		const result = deleteShippingClassFailure();
		expectErrorNotice( result );
	} );
} );
