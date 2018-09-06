/** @format */

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( '../shared/upsell', () => 'Upsell' );

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
} ) );

/**
 * External dependencies
 */
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
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
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
import { ConciergeMain } from '../main';

const props = {
	steps: [ 'Step1' ],
	availableTimes: [],
	site: {
		plan: {},
	},
	userSettings: {},
	skeleton: 'Skeleton',
};

describe( 'ConciergeMain basic tests', () => {
	test( 'should not blow up', () => {
		const comp = shallow( <ConciergeMain { ...props } /> );
		expect( comp.find( 'Main' ).length ).toBe( 1 );
	} );

	test( 'should short-circuit to <Skeleton /> when data is insufficient to render anything else', () => {
		let comp;

		comp = shallow( <ConciergeMain { ...props } availableTimes={ null } /> );
		expect( comp.find( 'Skeleton' ).length ).toBe( 1 );

		comp = shallow( <ConciergeMain { ...props } site={ null } /> );
		expect( comp.find( 'Skeleton' ).length ).toBe( 1 );

		comp = shallow( <ConciergeMain { ...props } site={ { plan: null } } /> );
		expect( comp.find( 'Skeleton' ).length ).toBe( 1 );

		comp = shallow( <ConciergeMain { ...props } userSettings={ null } /> );
		expect( comp.find( 'Skeleton' ).length ).toBe( 1 );
	} );
} );

describe( 'ConciergeMain.render()', () => {
	[
		PLAN_FREE,
		PLAN_JETPACK_FREE,
		PLAN_BLOGGER,
		PLAN_BLOGGER_2_YEARS,
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	].forEach( product_slug => {
		test( `Should render upsell for non-business plans (${ product_slug })`, () => {
			const comp = shallow( <ConciergeMain { ...props } site={ { plan: { product_slug } } } /> );
			expect( comp.find( 'Upsell' ).length ).toBe( 1 );
			expect( comp.find( 'Step1' ).length ).toBe( 0 );
		} );
	} );

	[ PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS ].forEach( product_slug => {
		test( `Should render CurrentStep for business plans (${ product_slug })`, () => {
			const comp = shallow( <ConciergeMain { ...props } site={ { plan: { product_slug } } } /> );
			expect( comp.find( 'Upsell' ).length ).toBe( 0 );
			expect( comp.find( 'Step1' ).length ).toBe( 1 );
		} );
	} );
} );
