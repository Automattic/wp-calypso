/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { NOTICE_CREATE, NOTICE_REMOVE } from 'state/action-types';

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
	saveCurrentlyOpenShippingClassWithUniqueSlug,
	createShippingClassesSaveActionList,
	removeShippingClass,
} from '../actions';

const siteId = 123;
const classId = 999;

const getState = state => ( {
	extensions: {
		woocommerce: {
			ui: {
				shipping: {
					[ siteId ]: {
						classes: {
							editing: true,
							editingClass: null,
							changes: {},
							created: [],
							deleted: [],
							updates: [],
							...state,
						},
					},
				},
			},
		},
	},
} );

const trapDispatch = ( callback, state ) => {
	const dispatched = [];
	const dispatch = action => dispatched.push( action );

	callback( dispatch, () => getState( state ) );

	return dispatched;
};

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
	 * saveCurrentlyOpenShippingClassWithUniqueSlug
	 */

	test( '#saveCurrentlyOpenShippingClassWithUniqueSlug with an existing slug', () => {
		const actions = trapDispatch( saveCurrentlyOpenShippingClassWithUniqueSlug( siteId ), {
			changes: {
				name: 'Class A',
			},
			created: [ 'temp-10' ],
			updates: [
				{
					id: 'temp-10',
					name: 'Class B',
					slug: 'class-a',
				},
			],
		} );

		// Attempting to use an existing slug should only generate an error notice
		expect( actions )
			.to.be.an( 'array' )
			.has.lengthOf( 1 );
		expect( actions[ 0 ] ).to.be.an( 'object' );
		expect( actions[ 0 ].type ).to.equal( NOTICE_CREATE );
		expect( actions[ 0 ].notice )
			.to.be.an( 'object' )
			.that.includes( {
				status: 'is-error',
			} );
	} );

	test( '#saveCurrentlyOpenShippingClassWithUniqueSlug with an explicit slug', () => {
		const actions = trapDispatch( saveCurrentlyOpenShippingClassWithUniqueSlug( siteId ), {
			changes: {
				name: 'Class A',
				slug: 'class-a',
			},
		} );

		expect( actions )
			.to.be.an( 'array' )
			.that.has.deep.members( [
				{
					type: WOOCOMMERCE_SHIPPING_CLASS_SAVE,
					siteId,
				},
				{
					type: NOTICE_REMOVE,
					noticeId: 'shipping-class-slug-error',
				},
			] );
	} );

	test( '#saveCurrentlyOpenShippingClassWithUniqueSlug with an auto-generated slug', () => {
		const actions = trapDispatch( saveCurrentlyOpenShippingClassWithUniqueSlug( siteId ), {
			changes: {
				name: 'Class A',
			},
		} );

		// Check for the auto-generation of the slug, the other actions
		// have already been tested in the previous test.
		expect( actions )
			.to.have.lengthOf( 3 )
			.and.deep.include( {
				type: WOOCOMMERCE_SHIPPING_CLASS_CHANGE,
				siteId,
				field: 'slug',
				value: 'class-a',
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
