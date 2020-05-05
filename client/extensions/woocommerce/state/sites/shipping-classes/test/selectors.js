/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	areShippingClassesLoaded,
	areShippingClassesLoading,
	getShippingClassOptions,
} from '../selectors';
import initialShippingClasses from './data/initial-state';
import { LOADING } from 'woocommerce/state/constants';

const siteId = 123;

const getState = ( shippingClasses = initialShippingClasses ) => {
	return {
		extensions: {
			woocommerce: {
				sites: {
					[ siteId ]: {
						shippingClasses,
					},
				},
			},
		},
	};
};

describe( 'Shipping classes selectors', () => {
	/**
	 * areShippingClassesLoaded
	 */
	test( 'areShippingClassesLoaded when nothing has been loaded yet', () => {
		const state = getState( false );
		const result = areShippingClassesLoaded( state, siteId );

		expect( result ).to.equal( false );
	} );

	test( 'areShippingClassesLoaded while classes are being loaded', () => {
		const state = getState( LOADING );
		const result = areShippingClassesLoaded( state, siteId );

		expect( result ).to.equal( false );
	} );

	test( 'areShippingClassesLoaded when they are really loaded', () => {
		const state = getState();
		const result = areShippingClassesLoaded( state, siteId );

		expect( result ).to.equal( true );
	} );

	/**
	 * areShippingClassesLoading
	 */
	test( 'areShippingClassesLoading when nothing has been loaded yet.', () => {
		const state = getState( false );
		const result = areShippingClassesLoading( state, siteId );

		expect( result ).to.equal( false );
	} );

	test( 'areShippingClassesLoading while classes are being loaded.', () => {
		const state = getState( LOADING );
		const result = areShippingClassesLoading( state, siteId );

		expect( result ).to.equal( true );
	} );

	test( 'areShippingClassesLoading when they are really loaded', () => {
		const state = getState();
		const result = areShippingClassesLoading( state, siteId );

		expect( result ).to.equal( false );
	} );

	/**
	 * getShippingClassOptions
	 */
	test( 'getShippingClassOptions when nothing has been loaded yet.', () => {
		const state = getState( false );
		const result = getShippingClassOptions( state, siteId );

		expect( result ).to.be.an( 'array' ).that.is.empty;
	} );

	test( 'getShippingClassOptions while classes are being loaded.', () => {
		const state = getState( LOADING );
		const result = getShippingClassOptions( state, siteId );

		expect( result ).to.be.an( 'array' ).that.is.empty;
	} );

	test( 'getShippingClassOptions when they are really loaded', () => {
		const state = getState();
		const result = getShippingClassOptions( state, siteId );

		expect( result ).to.equal( initialShippingClasses );
	} );
} );
