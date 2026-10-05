/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import { useDifmOffer } from '../../../utils/difm-offer';
import DIFMOfferCard from '../index';
import type { Site } from '@automattic/api-core';

jest.mock( '../../../utils/difm-offer', () => ( {
	...jest.requireActual( '../../../utils/difm-offer' ),
	useDifmOffer: jest.fn(),
} ) );

jest.mock( '../../../app/locale', () => ( {
	useLocale: () => 'en',
	useIntlLocale: () => 'en',
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	...jest.requireActual( '@wordpress/i18n' ),
	__: ( text: string ) => text,
} ) );

const mockUseDifmOffer = useDifmOffer as jest.MockedFunction< typeof useDifmOffer >;

const FIVE_DAYS_AGO = new Date( Date.now() - 5 * 24 * 60 * 60 * 1000 ).toISOString();

// Passes the old DIFM upsell card's own gates: unlaunched, not an agency site, over four days old.
const mockSite = {
	ID: 123,
	slug: 'example.wordpress.com',
	launch_status: 'unlaunched',
	is_wpcom_atomic: false,
	plan: { product_slug: 'free_plan' },
	options: { created_at: FIVE_DAYS_AGO },
} as Site;

describe( 'DIFMOfferCard', () => {
	test( 'shows the offer copy, and not the DIFM upsell, to an eligible user in a treatment', () => {
		mockUseDifmOffer.mockReturnValue( {
			isEligible: true,
			isLoading: false,
			variation: 'no_time',
		} );

		render( <DIFMOfferCard site={ mockSite } /> );

		expect( screen.getByRole( 'heading', { name: 'No time to build your site?' } ) ).toBeVisible();
		expect(
			screen.getByText( 'Let us take that off your plate. Ready in 4 days and free with Business.' )
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'See the offer' } ) ).toBeVisible();
		expect( screen.queryByText( 'We’ll bring your vision to life' ) ).not.toBeInTheDocument();
	} );

	test( 'shows the DIFM upsell to a user in control', () => {
		mockUseDifmOffer.mockReturnValue( {
			isEligible: true,
			isLoading: false,
			variation: 'control',
		} );

		render( <DIFMOfferCard site={ mockSite } /> );

		expect(
			screen.getByRole( 'heading', { name: 'We’ll bring your vision to life' } )
		).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'See the offer' } ) ).not.toBeInTheDocument();
	} );

	test( 'shows the DIFM upsell while the experiment assignment loads', () => {
		mockUseDifmOffer.mockReturnValue( {
			isEligible: true,
			isLoading: true,
			variation: 'no_time',
		} );

		render( <DIFMOfferCard site={ mockSite } /> );

		expect(
			screen.getByRole( 'heading', { name: 'We’ll bring your vision to life' } )
		).toBeVisible();
	} );

	test( 'passes the site plan, creation date and user locale to the eligibility hook', () => {
		mockUseDifmOffer.mockReturnValue( {
			isEligible: false,
			isLoading: false,
			variation: 'control',
		} );

		render( <DIFMOfferCard site={ mockSite } /> );

		expect( mockUseDifmOffer ).toHaveBeenCalledWith( {
			planSlug: 'free_plan',
			siteCreatedAt: FIVE_DAYS_AGO,
			localeSlug: 'en',
		} );
	} );
} );
