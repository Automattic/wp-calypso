/** @format */

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( '../shared/upsell', () => 'Upsell' );
jest.mock( '../shared/no-available-times', () => 'NoAvailableTimes' );

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

/**
 * Internal dependencies
 */
import { ConciergeMain } from '../main';
import {
	PLAN_FREE,
	PLAN_BUSINESS_MONTHLY,
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

const props = {
	steps: [ 'Step1' ],
	availableTimes: [
		1541506500000,
		1541508300000,
		1541510100000,
		1541511900000,
		1541513700000,
		1541515500000,
		1541516400000,
	],
	site: {
		plan: {},
	},
	userSettings: {},
	skeleton: 'Skeleton',
};

describe( 'ConciergeMain basic tests', () => {
	test( 'should not blow up', () => {
		const comp = shallow( <ConciergeMain { ...props } /> );
		expect( comp.find( 'Main' ) ).toHaveLength( 1 );
	} );

	test( 'should short-circuit to <Skeleton /> when data is insufficient to render anything else', () => {
		let comp;

		comp = shallow( <ConciergeMain { ...props } availableTimes={ null } /> );
		expect( comp.find( 'Skeleton' ) ).toHaveLength( 1 );

		comp = shallow( <ConciergeMain { ...props } site={ null } /> );
		expect( comp.find( 'Skeleton' ) ).toHaveLength( 1 );

		comp = shallow( <ConciergeMain { ...props } site={ { plan: null } } /> );
		expect( comp.find( 'Skeleton' ) ).toHaveLength( 1 );

		comp = shallow( <ConciergeMain { ...props } userSettings={ null } /> );
		expect( comp.find( 'Skeleton' ) ).toHaveLength( 1 );
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
			expect( comp.find( 'Upsell' ) ).toHaveLength( 1 );
			expect( comp.find( 'Step1' ) ).toHaveLength( 0 );
		} );
	} );

	[ PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS ].forEach( product_slug => {
		test( `Should render NoAvailableTimes if no times are available (${ product_slug })`, () => {
			const propsWithoutAvailableTimes = { ...props, availableTimes: [] };
			const comp = shallow(
				<ConciergeMain { ...propsWithoutAvailableTimes } site={ { plan: { product_slug } } } />
			);
			expect( comp.find( 'NoAvailableTimes' ) ).toHaveLength( 1 );
		} );
	} );

	[ PLAN_BUSINESS_MONTHLY, PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS ].forEach( product_slug => {
		test( `Should render CurrentStep for business plans (${ product_slug })`, () => {
			const comp = shallow( <ConciergeMain { ...props } site={ { plan: { product_slug } } } /> );
			expect( comp.find( 'Upsell' ) ).toHaveLength( 0 );
			expect( comp.find( 'Step1' ) ).toHaveLength( 1 );
		} );
	} );
} );
