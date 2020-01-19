/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import ProductIcon from '../index';
import {
	PLAN_FREE,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from 'lib/plans/constants';
import { JETPACK_BACKUP_PRODUCTS } from 'lib/products-values/constants';

describe( 'ProductIcon basic tests', () => {
	test( 'should not blow up and have proper CSS class', () => {
		const comp = shallow( <ProductIcon product={ PLAN_FREE } /> );
		expect( comp.find( '.product-icon' ) ).toHaveLength( 1 );
	} );
} );

describe( 'ProductIcon should have a class name corresponding to appropriate plan', () => {
	[
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
	].forEach( product => {
		test( 'Personal', () => {
			const comp = shallow( <ProductIcon product={ product } /> );
			expect( comp.find( '.product-icon__personal' ) ).toHaveLength( 1 );
		} );
	} );

	[
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
	].forEach( product => {
		test( 'Premium', () => {
			const comp = shallow( <ProductIcon product={ product } /> );
			expect( comp.find( '.product-icon__premium' ) ).toHaveLength( 1 );
		} );
	} );

	[
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	].forEach( product => {
		test( 'Business', () => {
			const comp = shallow( <ProductIcon product={ product } /> );
			expect( comp.find( '.product-icon__business' ) ).toHaveLength( 1 );
		} );
	} );

	[ PLAN_ECOMMERCE, PLAN_ECOMMERCE_2_YEARS ].forEach( product => {
		test( 'Ecommerce', () => {
			const comp = shallow( <ProductIcon product={ product } /> );
			expect( comp.find( '.product-icon__ecommerce' ) ).toHaveLength( 1 );
		} );
	} );

	[ PLAN_FREE, PLAN_JETPACK_FREE ].forEach( product => {
		test( 'Free', () => {
			const comp = shallow( <ProductIcon product={ product } /> );
			expect( comp.find( '.product-icon__free' ) ).toHaveLength( 1 );
		} );
	} );
} );

describe( 'ProductIcon should have a class name corresponding to appropriate product', () => {
	JETPACK_BACKUP_PRODUCTS.forEach( product => {
		test( 'Jetpack Backup', () => {
			const comp = shallow( <ProductIcon product={ product } /> );
			expect( comp.find( '.product-icon__backup' ) ).toHaveLength( 1 );
		} );
	} );
} );
