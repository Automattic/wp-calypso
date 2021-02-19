/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { UpsellNudge } from '../index';
import {
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from 'calypso/lib/plans/constants';

const props = {
	callToAction: null,
	title: 'banner title',
	forceDisplay: true,
};

describe( 'UpsellNudge should render a Banner with a class name corresponding to appropriate plan', () => {
	[
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
	].forEach( ( plan ) => {
		test( 'Personal', () => {
			const comp = shallow( <UpsellNudge { ...props } plan={ plan } /> );
			expect( comp.find( '.is-upgrade-personal' ) ).toHaveLength( 1 );
		} );
	} );

	[
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
	].forEach( ( plan ) => {
		test( 'Premium', () => {
			const comp = shallow( <UpsellNudge { ...props } plan={ plan } /> );
			expect( comp.find( '.is-upgrade-premium' ) ).toHaveLength( 1 );
		} );
	} );

	[
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	].forEach( ( plan ) => {
		test( 'Business', () => {
			const comp = shallow( <UpsellNudge { ...props } plan={ plan } /> );
			expect( comp.find( '.is-upgrade-business' ) ).toHaveLength( 1 );
		} );
	} );
} );
