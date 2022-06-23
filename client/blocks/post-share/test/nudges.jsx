/**
 * @jest-environment jsdom
 */
jest.mock( 'calypso/lib/analytics/tracks', () => ( {} ) );
jest.mock( 'calypso/lib/analytics/page-view', () => ( {} ) );
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => 'PageViewTracker' );
jest.mock( 'calypso/blocks/upsell-nudge', () => ( {
	__esModule: true,
	default: ( { plan } ) => <div data-testid="upsell-nudge-plan">{ plan }</div>,
} ) );

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
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
} from '@automattic/calypso-products';
import { render, screen } from '@testing-library/react';
import { UpgradeToPremiumNudgePure } from '../nudges';

const props = {
	translate: ( x ) => x,
	canUserUpgrade: true,
};

describe( 'UpgradeToPremiumNudgePure basic tests', () => {
	test( 'should not blow up', () => {
		render( <UpgradeToPremiumNudgePure { ...props } /> );
		expect( screen.getByTestId( 'upsell-nudge-plan' ) ).toBeVisible();
	} );

	test( 'hide when user cannot upgrade', () => {
		const localProps = {
			translate: ( x ) => x,
			canUserUpgrade: false,
		};
		render( <UpgradeToPremiumNudgePure { ...localProps } /> );
		expect( screen.queryByTestId( 'upsell-nudge-plan' ) ).not.toBeInTheDocument();
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
		PLAN_BUSINESS_MONTHLY,
		PLAN_BUSINESS,
		PLAN_ECOMMERCE,
		PLAN_BLOGGER_2_YEARS,
		PLAN_PERSONAL_2_YEARS,
		PLAN_PREMIUM_2_YEARS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_ECOMMERCE_2_YEARS,
	].forEach( ( plan ) => {
		test( `Should pass 2-years wp.com premium plan for 2-years plans ${ plan }`, () => {
			render( <UpgradeToPremiumNudgePure { ...props } isJetpack={ false } planSlug={ plan } /> );
			expect( screen.getByTestId( 'upsell-nudge-plan' ) ).toHaveTextContent( plan );
		} );
	} );
} );
