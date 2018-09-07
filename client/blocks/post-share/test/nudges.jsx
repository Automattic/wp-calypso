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
import { UpgradeToPremiumNudgePure } from '../nudges';

const props = {
	translate: x => x,
};

describe( 'UpgradeToPremiumNudgePure basic tests', () => {
	test( 'should not blow up', () => {
		const comp = shallow( <UpgradeToPremiumNudgePure { ...props } /> );
		expect( comp.find( 'Banner' ).length ).toBe( 1 );
	} );
} );

describe( 'UpgradeToPremiumNudgePure.render()', () => {
	[
		PLAN_JETPACK_FREE,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
		PLAN_FREE,
		PLAN_BLOGGER,
		PLAN_PERSONAL,
		PLAN_PREMIUM,
		PLAN_BUSINESS,
		PLAN_BLOGGER_2_YEARS,
		PLAN_PERSONAL_2_YEARS,
		PLAN_PREMIUM_2_YEARS,
		PLAN_BUSINESS_2_YEARS,
	].forEach( plan => {
		test( `Should pass 2-years wp.com premium plan for 2-years plans ${ plan }`, () => {
			const comp = shallow(
				<UpgradeToPremiumNudgePure { ...props } isJetpack={ false } planSlug={ plan } />
			);
			expect( comp.find( 'Banner' ).props().plan ).toBe( plan );
		} );
	} );
} );
