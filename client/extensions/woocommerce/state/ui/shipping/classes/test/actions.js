/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_CLASS_EDIT,
	WOOCOMMERCE_SHIPPING_CLASS_CLOSE,
	WOOCOMMERCE_SHIPPING_CLASS_ADD,
	WOOCOMMERCE_SHIPPING_CLASS_CHANGE,
	WOOCOMMERCE_SHIPPING_CLASS_SAVE,
	WOOCOMMERCE_SHIPPING_CLASS_REMOVE,
	WOOCOMMERCE_SHIPPING_CLASSES_ACTION_LIST_CREATE,
} from 'woocommerce/state/action-types';

import {
	editShippingClass,
	closeShippingClass,
	addShippingClass,
	updateShippingClassSetting,
	saveCurrentlyOpenShippingClass,
	createShippingClassesSaveActionList,
	removeShippingClass,
} from '../actions';

const siteId = 123;
const classId = 999;

describe( 'Shipping classes UI state actions', () => {
	/**
	 * editShippingClass
	 */

	test( '#editShippingClass', () => {
		const result = editShippingClass( siteId, classId );

		expect( result ).to.eql( {
			type: WOOCOMMERCE_SHIPPING_CLASS_EDIT,
			siteId,
			classId,
		} );
	} );

	/**
	 * closeShippingClass
	 */

	test( '#closeShippingClass', () => {
		const result = closeShippingClass( siteId );

		expect( result ).to.eql( {
			type: WOOCOMMERCE_SHIPPING_CLASS_CLOSE,
			siteId,
		} );
	} );

	/**
	 * addShippingClass
	 */

	test( '#addShippingClass', () => {
		const result = addShippingClass( siteId );

		expect( result ).to.eql( {
			type: WOOCOMMERCE_SHIPPING_CLASS_ADD,
			siteId,
		} );
	} );

	/**
	 * updateShippingClassSetting
	 */

	test( '#updateShippingClassSetting', () => {
		const field = 'slug';
		const value = 'slug-123';

		const result = updateShippingClassSetting( siteId, field, value );

		expect( result ).to.eql( {
			type: WOOCOMMERCE_SHIPPING_CLASS_CHANGE,
			siteId,
			field,
			value,
		} );
	} );

	/**
	 * saveCurrentlyOpenShippingClass
	 */

	test( '#saveCurrentlyOpenShippingClass', () => {
		const result = saveCurrentlyOpenShippingClass( siteId );

		expect( result ).to.eql( {
			type: WOOCOMMERCE_SHIPPING_CLASS_SAVE,
			siteId,
		} );
	} );

	/**
	 * createShippingClassesSaveActionList
	 */

	test( '#createShippingClassesSaveActionList', () => {
		const successAction = () => {};
		const failureAction = () => {};

		const result = createShippingClassesSaveActionList( siteId, successAction, failureAction );

		expect( result ).to.eql( {
			type: WOOCOMMERCE_SHIPPING_CLASSES_ACTION_LIST_CREATE,
			siteId,
			successAction,
			failureAction,
		} );
	} );

	/**
	 * removeShippingClass
	 */

	test( '#removeShippingClass', () => {
		const result = removeShippingClass( siteId, classId );

		expect( result ).to.eql( {
			type: WOOCOMMERCE_SHIPPING_CLASS_REMOVE,
			siteId,
			classId,
		} );
	} );
} );
