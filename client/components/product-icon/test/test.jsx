jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'i18n-calypso', () => ( {
	localize: Comp => props => (
		<Comp
			{ ...props }
			translate={ function( x ) {
				return x;
			} }
		/>
	),
	numberFormat: x => x,
	translate: x => x,
} ) );

/**
 * External dependencies
 */
import { assert } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import {
	PLAN_FREE,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from 'lib/plans/constants';
import { JETPACK_BACKUP_PRODUCTS } from 'lib/products-values/constants';

/**
 * Internal dependencies
 */
import ProductIcon from '../index';

describe( 'ProductIcon basic tests', () => {
	test( 'should not blow up and have proper CSS class', () => {
		const comp = shallow( <ProductIcon product={ PLAN_FREE } /> );
		assert.lengthOf( comp.find( '.product-icon' ), 1 );
	} );
} );

describe( 'ProductIcon should have a class name corresponding to appropriate plan or product', () => {
	[
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
	].forEach( product => {
		test( 'Personal', () => {
			const comp = shallow( <ProductIcon product={ product } /> );
			assert.lengthOf( comp.find( '.product-icon__personal' ), 1 );
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
			assert.lengthOf( comp.find( '.product-icon__premium' ), 1 );
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
			assert.lengthOf( comp.find( '.product-icon__business' ), 1 );
		} );
	} );

	[ PLAN_FREE, PLAN_JETPACK_FREE ].forEach( product => {
		test( 'Free', () => {
			const comp = shallow( <ProductIcon product={ product } /> );
			assert.lengthOf( comp.find( '.product-icon__free' ), 1 );
		} );
	} );

	JETPACK_BACKUP_PRODUCTS.forEach( product => {
		test( 'Jetpack Backup', () => {
			const comp = shallow( <ProductIcon product={ product } /> );
			assert.lengthOf( comp.find( '.product-icon__backup' ), 1 );
		} );
	} );
} );
