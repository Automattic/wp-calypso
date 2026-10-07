/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { DIFM_OFFER_EXPERIMENT } from '../../../utils/difm-offer';
import DIFMOfferCard from '../index';
import type { Site } from '@automattic/api-core';

jest.mock( '../../../app/locale', () => ( {
	useLocale: () => 'en',
	useIntlLocale: () => 'en',
} ) );

const FIVE_DAYS_AGO = new Date( Date.now() - 5 * 24 * 60 * 60 * 1000 ).toISOString();

// Passes the old DIFM upsell card's own gates: unlaunched, not an agency site, over four days old.
const mockSite = {
	ID: 123,
	slug: 'example.wordpress.com',
	launch_status: 'unlaunched',
	is_wpcom_atomic: false,
	is_a4a_dev_site: false,
	plan: { product_slug: 'free_plan' },
	options: { created_at: FIVE_DAYS_AGO },
} as Site;

// Seed a live assignment into the storage ExPlat reads from, so the real `useExperiment`
// hook resolves to the given variation without a network call.
function assignExperiment( variationName: string | null ) {
	window.localStorage.setItem(
		`explat-experiment--${ DIFM_OFFER_EXPERIMENT }`,
		JSON.stringify( {
			experimentName: DIFM_OFFER_EXPERIMENT,
			variationName,
			retrievedTimestamp: Date.now(),
			ttl: 3600,
		} )
	);
}

describe( 'DIFMOfferCard', () => {
	afterEach( () => {
		window.localStorage.clear();
		nock.cleanAll();
	} );

	test( 'shows the offer copy, and not the DIFM upsell, to an eligible user in a treatment', async () => {
		assignExperiment( 'no_time' );

		render( <DIFMOfferCard site={ mockSite } /> );

		expect(
			await screen.findByRole( 'heading', { name: 'No time to build your site?' } )
		).toBeVisible();
		expect(
			screen.getByText( 'Let us take that off your plate. Ready in 4 days and free with Business.' )
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'See the offer' } ) ).toBeVisible();
		expect( screen.queryByText( 'We’ll bring your vision to life' ) ).not.toBeInTheDocument();
	} );

	test( 'records the variation on the offer impression and click events', async () => {
		assignExperiment( 'no_time' );
		const expectedProperties = {
			upsell_id: 'site-overview-difm-offer',
			upsell_feature_id: 'difm-offer',
			variation: 'no_time',
		};

		const { recordTracksEvent } = render( <DIFMOfferCard site={ mockSite } /> );
		await userEvent.click( await screen.findByRole( 'button', { name: 'See the offer' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_upsell_impression',
			expectedProperties
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_upsell_click',
			expectedProperties
		);
	} );

	test( 'shows the DIFM upsell to a user in control', async () => {
		assignExperiment( 'control' );

		render( <DIFMOfferCard site={ mockSite } /> );

		expect(
			await screen.findByRole( 'heading', { name: 'We’ll bring your vision to life' } )
		).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'See the offer' } ) ).not.toBeInTheDocument();
	} );

	test( 'renders neither card while an eligible user’s assignment loads', () => {
		nock( 'https://public-api.wordpress.com' )
			.get( /experiments\/0\.1\.0\/assignments\/calypso/ )
			.reply( 200, { variations: {}, ttl: 3600 } );

		const { container } = render( <DIFMOfferCard site={ mockSite } /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'does not show the offer on an A4A dev site in a treatment', () => {
		assignExperiment( 'no_time' );

		render( <DIFMOfferCard site={ { ...mockSite, is_a4a_dev_site: true } } /> );

		expect(
			screen.queryByRole( 'heading', { name: 'No time to build your site?' } )
		).not.toBeInTheDocument();
	} );

	test( 'shows the DIFM upsell, and not the offer, on a site past the offer age limit in a treatment', () => {
		assignExperiment( 'no_time' );
		const thirtyDaysAgo = new Date( Date.now() - 30 * 24 * 60 * 60 * 1000 ).toISOString();

		render(
			<DIFMOfferCard site={ { ...mockSite, options: { created_at: thirtyDaysAgo } } as Site } />
		);

		expect(
			screen.getByRole( 'heading', { name: 'We’ll bring your vision to life' } )
		).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'No time to build your site?' } )
		).not.toBeInTheDocument();
	} );
} );
