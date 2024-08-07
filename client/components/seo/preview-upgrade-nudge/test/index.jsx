/** @jest-environment jsdom */
jest.mock( 'calypso/lib/analytics/track-component-view', () => ( { eventName } ) => (
	<div data-testid="track-component-view">{ eventName }</div>
) );
jest.mock( 'calypso/blocks/upsell-nudge', () => ( { plan } ) => (
	<div data-testid="upsell-nudge">{ plan }</div>
) );
jest.mock( 'calypso/components/data/query-products-list', () => 'query-products' );

import {
	PLAN_FREE,
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
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_BUSINESS,
} from '@automattic/calypso-products';
import { screen } from '@testing-library/react';
import { renderWithProvider as render } from 'calypso/test-helpers/testing-library';
import { SeoPreviewNudge } from '../index';

const props = {
	translate: ( x ) => x,
};

describe( 'SeoPreviewNudge basic tests', () => {
	test( 'should not blow up', () => {
		const { container } = render( <SeoPreviewNudge { ...props } /> );
		expect( container.firstChild ).toHaveClass( 'preview-upgrade-nudge' );
	} );

	test( 'should track view', () => {
		render( <SeoPreviewNudge { ...props } /> );
		const track = screen.queryByTestId( 'track-component-view' );
		expect( track ).toBeVisible();
		expect( track ).toHaveTextContent( 'calypso_seo_preview_upgrade_nudge_impression' );
	} );
} );

describe( 'UpsellNudge should get appropriate plan constant', () => {
	test.each( [ PLAN_FREE, PLAN_BLOGGER, PLAN_PERSONAL, PLAN_PREMIUM ] )(
		`Pro 1 year for (%s)`,
		( product_slug ) => {
			render(
				<SeoPreviewNudge { ...props } isJetpack={ false } site={ { plan: { product_slug } } } />
			);
			const nudge = screen.queryByTestId( 'upsell-nudge' );
			expect( nudge ).toBeVisible();
			expect( nudge ).toHaveTextContent( PLAN_BUSINESS );
		}
	);

	test.each( [ PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS ] )(
		`Business 2 year for (%s)`,
		( product_slug ) => {
			render(
				<SeoPreviewNudge { ...props } isJetpack={ false } site={ { plan: { product_slug } } } />
			);
			const nudge = screen.queryByTestId( 'upsell-nudge' );
			expect( nudge ).toBeVisible();
			expect( nudge ).toHaveTextContent( PLAN_BUSINESS_2_YEARS );
		}
	);

	test.each( [
		PLAN_JETPACK_FREE,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_JETPACK_BUSINESS_MONTHLY,
		PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	] )( `Jetpack Business for (%s)`, ( product_slug ) => {
		render( <SeoPreviewNudge { ...props } isJetpack site={ { plan: { product_slug } } } /> );
		const nudge = screen.queryByTestId( 'upsell-nudge' );
		expect( nudge ).toBeVisible();
		expect( nudge ).toHaveTextContent( PLAN_JETPACK_SECURITY_DAILY );
	} );
} );
