/** @format */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
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
import { domainProductSlugs } from 'lib/domains/constants';
import ProductIcon from '../index';
import PlanIcon from 'components/plans/plan-icon';
import Gridicon from 'gridicons';

describe( 'ProductIcon plan icon tests', () => {
	test( 'CSS', () => {
		const wrapper = shallow(
			<ProductIcon productSlug={ PLAN_BUSINESS } className="test__arbitrary" />
		);
		expect( wrapper.find( '.product-icon' ) ).toHaveLength( 1 );
		expect( wrapper.find( '.test__arbitrary' ) ).toHaveLength( 1 );
		expect( wrapper.contains( <PlanIcon plan={ PLAN_BUSINESS } /> ) );
	} );

	[
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	].forEach( plan => {
		test( `PlanIcon for plan: ${ plan }`, () => {
			const wrapper = shallow( <ProductIcon productSlug={ plan } /> );
			expect( wrapper.find( '.product-icon' ) ).toHaveLength( 1 );
			expect( wrapper.contains( <PlanIcon plan={ plan } /> ) );
		} );
	} );

	[ PLAN_FREE, PLAN_JETPACK_FREE ].forEach( plan => {
		test( `PlanIcon for free plans: ${ plan }`, () => {
			const wrapper = shallow( <ProductIcon productSlug={ plan } /> );
			expect( wrapper.find( '.product-icon' ) ).toHaveLength( 1 );
			expect( wrapper.contains( <PlanIcon plan={ plan } /> ) );
		} );
	} );
} );

describe( 'ProductIcon gridicons for non plans', () => {
	test( 'Domains', () => {
		const wrapper = shallow( <ProductIcon productSlug={ domainProductSlugs.TRANSFER_IN } /> );
		expect( wrapper.contains( <Gridicon icon={ 'domains' } size={ 24 } /> ) );
	} );

	test( 'Themes', () => {
		const wrapper = shallow( <ProductIcon productSlug={ 'premium_theme' } /> );
		expect( wrapper.contains( <Gridicon icon={ 'themes' } size={ 24 } /> ) );
	} );

	test( 'Google Apps (mail)', () => {
		const wrapper = shallow( <ProductIcon productSlug={ 'gapps_unlimited' } /> );
		expect( wrapper.contains( <Gridicon icon={ 'mail' } size={ 24 } /> ) );
	} );
} );

describe( 'ProductIcon empty set', () => {
	test( 'unkown example', () => {
		const wrapper = shallow( <ProductIcon productSlug={ 'unknown' } /> );
		expect( wrapper.find( '.product-icon' ).children() ).toHaveLength( 0 );
	} );
} );
