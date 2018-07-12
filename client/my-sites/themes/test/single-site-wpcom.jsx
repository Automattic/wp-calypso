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
jest.mock( 'components/data/query-site-purchases', () => 'QuerySitePurchases' );
jest.mock( 'my-sites/themes/current-theme', () => ( {} ) );
jest.mock( 'my-sites/themes/theme-options', () => ( { connectOptions: x => x } ) );

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
} from 'lib/plans/constants';

/**
 * Internal dependencies
 */
import { ConnectedSingleSiteWpcom } from '../single-site-wpcom';

const props = {
	translate: x => x,
	requestingSitePlans: false,
	hasUnlimitedPremiumThemes: false,
};

describe( 'ConnectedSingleSiteWpcom basic tests', () => {
	test( 'should not blow up', () => {
		const comp = shallow( <ConnectedSingleSiteWpcom { ...props } /> );
		expect( comp.find( 'Banner' ).length ).toBe( 1 );
	} );
} );

describe( 'ConnectedSingleSiteWpcom.render()', () => {
	[ PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS ].forEach( plan => {
		test( `Should pass wp.com premium plan for annual wp.com plans ${ plan }`, () => {
			const comp = shallow(
				<ConnectedSingleSiteWpcom { ...props } isJetpack={ false } currentPlanSlug={ plan } />
			);
			expect( comp.find( 'Banner' ).props().plan ).toBe( PLAN_PREMIUM );
		} );
	} );

	[ PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS, PLAN_BUSINESS_2_YEARS ].forEach( plan => {
		test( `Should pass 2-years wp.com premium plan for 2-years plans ${ plan }`, () => {
			const comp = shallow(
				<ConnectedSingleSiteWpcom { ...props } isJetpack={ false } currentPlanSlug={ plan } />
			);
			expect( comp.find( 'Banner' ).props().plan ).toBe( PLAN_PREMIUM_2_YEARS );
		} );
	} );
} );
