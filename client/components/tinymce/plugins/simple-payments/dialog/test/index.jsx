/** @format */

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'lib/analytics/index', () => ( {} ) );
jest.mock( 'lib/analytics/page-view-tracker', () => 'PageViewTracker' );
jest.mock( 'lib/user', () => ( {} ) );
jest.mock( 'components/main', () => 'MainComponent' );
jest.mock( 'components/popover', () => 'Popover' );
jest.mock( 'components/banner', () => 'Banner' );
jest.mock( 'state/selectors/get-simple-payments', () => () => {} );
jest.mock( 'state/current-user/selectors', () => ( {
	getCurrentUserCurrencyCode: () => {},
	getCurrentUserEmail: () => {},
} ) );
jest.mock( '../navigation', () => 'Navigation' );
jest.mock( '../form', () => ( {
	isProductFormValid: () => {},
	isProductFormDirty: () => {},
} ) );
jest.mock( '../list', () => 'List' );

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
import React from 'react';
import {
	PLANS_LIST,
	PLAN_FREE,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from 'lib/plans/constants';

/**
 * Internal dependencies
 */
import { SimplePaymentsDialog, mapStateToProps } from '../index';

import { shallow } from 'enzyme';

/** @format */

const props = {
	shouldQuerySitePlans: false,
	isJetpackNotSupported: true,
	translate: x => x,
	currentPlan: { product_slug: PLAN_FREE },
};

describe( 'SimplePaymentsDialog basic tests', () => {
	test( 'should not blow up', () => {
		const comp = shallow( <SimplePaymentsDialog { ...props } /> );
		expect( comp.find( 'EmptyContent' ).length ).toBe( 1 );
	} );
} );

describe( 'SimplePaymentsDialog.render()', () => {
	[
		PLAN_FREE,
		PLAN_JETPACK_FREE,
		PLAN_PERSONAL,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_PREMIUM,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	].forEach( plan => {
		test( `Should render proper upsell for non-business plans (${ plan })`, () => {
			const comp = shallow(
				<SimplePaymentsDialog { ...props } currentPlan={ { product_slug: plan } } />
			);
			const banner = shallow( comp.find( 'EmptyContent' ).props().action );
			expect( banner.props().plan ).toBe( PLAN_PREMIUM );
		} );
	} );

	[ PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS, PLAN_BUSINESS_2_YEARS ].forEach( plan => {
		test( `Should render proper upsell for business plans (${ plan })`, () => {
			const comp = shallow(
				<SimplePaymentsDialog { ...props } currentPlan={ { product_slug: plan } } />
			);
			const banner = shallow( comp.find( 'EmptyContent' ).props().action );
			expect( banner.props().plan ).toBe( PLAN_PREMIUM_2_YEARS );
		} );
	} );
} );

describe( 'mapStateToProps()', () => {
	const allPlans = ( function() {
		const plans = {};
		for ( const slug in PLANS_LIST ) {
			plans[ slug ] = {
				product_slug: slug,
			};
		}
		return plans;
	} )();

	const getState = plan => ( {
		ui: {
			selectedSiteId: 1,
		},
		plans: {
			items: allPlans,
		},
		sites: {
			plans: allPlans,
			items: {
				1: {
					plan: {
						product_slug: plan,
					},
				},
			},
		},
	} );

	[
		PLAN_FREE,
		PLAN_PERSONAL,
		PLAN_PREMIUM,
		PLAN_BUSINESS,
		PLAN_PERSONAL_2_YEARS,
		PLAN_PREMIUM_2_YEARS,
		PLAN_BUSINESS_2_YEARS,
	].forEach( plan => {
		test( 'Should return 2-year premium plan for other 1 year plans', () => {
			expect( mapStateToProps( getState( plan ), { siteId: 1 } ).currentPlan.product_slug ).toBe(
				plan
			);
		} );
	} );
} );
