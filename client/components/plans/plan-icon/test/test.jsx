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

/**
 * Internal dependencies
 */
import PlanIcon from '../index';

const props = {
	plan: PLAN_FREE,
};

describe( 'PlanIcon basic tests', () => {
	test( 'should not blow up and have proper CSS class', () => {
		const comp = shallow( <PlanIcon { ...props } /> );
		assert.lengthOf( comp.find( '.plan-icon' ), 1 );
	} );
} );

describe( 'PlanIcon should have a class name corresponding to appropriate plan', () => {
	[
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
	].forEach( plan => {
		test( 'Personal', () => {
			const comp = shallow( <PlanIcon { ...props } plan={ plan } /> );
			assert.lengthOf( comp.find( '.plan-icon__personal' ), 1 );
		} );
	} );

	[
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
	].forEach( plan => {
		test( 'Premium', () => {
			const comp = shallow( <PlanIcon { ...props } plan={ plan } /> );
			assert.lengthOf( comp.find( '.plan-icon__premium' ), 1 );
		} );
	} );

	[
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	].forEach( plan => {
		test( 'Business', () => {
			const comp = shallow( <PlanIcon { ...props } plan={ plan } /> );
			assert.lengthOf( comp.find( '.plan-icon__business' ), 1 );
		} );
	} );

	[ PLAN_FREE, PLAN_JETPACK_FREE ].forEach( plan => {
		test( 'Free', () => {
			const comp = shallow( <PlanIcon { ...props } plan={ plan } /> );
			assert.lengthOf( comp.find( '.plan-icon__free' ), 1 );
		} );
	} );
} );
