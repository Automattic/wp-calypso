/** @jest-environment jsdom */
jest.mock( 'calypso/components/purchase-detail', () => ( { description } ) => (
	<div data-testid="purchase-detail">{ description }</div>
) );

import {
	PLAN_FREE,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from '@automattic/calypso-products';
import { render, screen } from '@testing-library/react';
import { VideoAudioPosts } from '../video-audio-posts';

describe( 'VideoAudioPosts basic tests', () => {
	const props = {
		plan: PLAN_FREE,
		translate: ( x ) => x,
		selectedSite: {
			plan: PLAN_FREE,
		},
	};

	test( 'should not blow up and have proper CSS class', () => {
		const { container } = render( <VideoAudioPosts { ...props } /> );
		expect( container.firstChild ).toBeVisible();
		expect( container.firstChild ).toHaveClass( 'product-purchase-features-list__item' );
		expect( container.firstChild.firstChild ).toBe( screen.queryByTestId( 'purchase-detail' ) );
	} );
} );

describe( 'VideoAudioPosts should use proper description', () => {
	const props = {
		plan: PLAN_FREE,
		translate: ( x ) => x,
		selectedSite: {
			plan: PLAN_FREE,
		},
	};

	test.each( [ PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS, PLAN_ECOMMERCE, PLAN_ECOMMERCE_2_YEARS ] )(
		`for business plan %s`,
		( plan ) => {
			render( <VideoAudioPosts { ...props } plan={ plan } /> );
			expect( screen.queryByTestId( 'purchase-detail' ) ).toHaveTextContent(
				/the %\(planName\)s Plan has %\(storageLimit\)d GB storage/
			);
		}
	);

	test.each( [ PLAN_PREMIUM, PLAN_PREMIUM_2_YEARS ] )( `for premium plan %s`, ( plan ) => {
		render( <VideoAudioPosts { ...props } plan={ plan } /> );
		expect( screen.queryByTestId( 'purchase-detail' ) ).toHaveTextContent( /13 GB of media/ );
	} );

	test.each( [
		PLAN_FREE,
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_JETPACK_FREE,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	] )( `for plans %s`, ( plan ) => {
		render( <VideoAudioPosts { ...props } plan={ plan } /> );
		expect( screen.queryByTestId( 'purchase-detail' ) ).toBeEmptyDOMElement();
	} );
} );
