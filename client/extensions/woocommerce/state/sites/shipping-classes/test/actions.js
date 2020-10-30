/**
 * External dependencies
 */
import { expect } from 'chai';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_CLASSES_REQUEST,
	WOOCOMMERCE_SHIPPING_CLASSES_REQUEST_SUCCESS,
} from './../../../action-types';
import { NOTICE_CREATE } from 'calypso/state/action-types';
import {
	fetchShippingClassesSuccess,
	fetchShippingClassesFailure,
	fetchShippingClasses,
} from '../actions';
import initialShippingClasses from './data/initial-state';

const siteId = 123;

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
		const result = fetchShippingClassesFailure( { siteId }, '' );

		expect( result ).to.be.an( 'object' );
		expect( result.type ).to.equal( NOTICE_CREATE );
		expect( result.notice ).to.be.an( 'object' );
		expect( result.notice.status ).to.equal( 'is-error' );
	} );

	/**
	 * fetchShippingClasses
	 */

	test( '#fetchShippingClasses', () => {
		expect( fetchShippingClasses( siteId )( identity, getState( false ) ) ).to.eql( {
			type: WOOCOMMERCE_SHIPPING_CLASSES_REQUEST,
			siteId,
		} );
	} );

	test( '#fetchShippingClasses when classes have been already loaded', () => {
		expect( fetchShippingClasses( siteId )( identity, getState() ) ).to.equal( undefined );
	} );
} );
