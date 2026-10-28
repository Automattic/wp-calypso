/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { act, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import { DIFM_OFFER_EXPERIMENT } from '../../../utils/difm-offer';
import DifmOfferDeepLink from '../deep-link';
import type { Site } from '@automattic/api-core';

jest.mock( '../../../app/locale', () => ( {
	useLocale: () => 'en',
	useIntlLocale: () => 'en',
} ) );

const FIVE_DAYS_AGO = new Date( Date.now() - 5 * 24 * 60 * 60 * 1000 ).toISOString();

const mockSite = {
	ID: 123,
	slug: 'example.wordpress.com',
	is_a4a_dev_site: false,
	plan: { product_slug: 'free_plan' },
	options: { created_at: FIVE_DAYS_AGO },
} as Site;

const originalUrl = window.location.href;

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

afterEach( () => {
	nock.cleanAll();
	window.localStorage.clear();
	window.history.replaceState( null, '', originalUrl );
} );

describe( 'DifmOfferDeepLink', () => {
	test( 'opens the offer with the linking source, and clears the params', async () => {
		assignExperiment( 'no_time_to_build' );
		window.history.replaceState( null, '', '/?difmOffer=open&source=site-setup' );

		const { recordTracksEvent } = render( <DifmOfferDeepLink site={ mockSite } /> );

		expect(
			await screen.findByRole( 'dialog', { name: 'We’ll build your site for free' } )
		).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_upsell_impression',
			expect.objectContaining( { upsell_id: 'difm-offer-modal', source: 'site-setup' } )
		);
		await waitFor( () => expect( window.location.search ).toBe( '' ) );
	} );

	test( 'keeps the params while the assignment loads', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( /experiments\/0\.1\.0\/assignments\/calypso/ )
			.reply( 200, { variations: {}, ttl: 3600 } );
		window.history.replaceState( null, '', '/?difmOffer=open&source=site-setup' );

		render( <DifmOfferDeepLink site={ mockSite } /> );
		await act( () => Promise.resolve() );

		expect( window.location.search ).toBe( '?difmOffer=open&source=site-setup' );
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );

	test( 'records the site overview as the source for an unknown source', async () => {
		assignExperiment( 'no_time_to_build' );
		window.history.replaceState( null, '', '/?difmOffer=open&source=newsletter' );

		const { recordTracksEvent } = render( <DifmOfferDeepLink site={ mockSite } /> );

		await screen.findByRole( 'dialog', { name: 'We’ll build your site for free' } );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_upsell_impression',
			expect.objectContaining( { source: 'site-overview' } )
		);
	} );

	test( 'does not open the offer for a user in control, and clears the params', async () => {
		assignExperiment( 'control' );
		window.history.replaceState( null, '', '/?difmOffer=open&source=site-setup' );

		render( <DifmOfferDeepLink site={ mockSite } /> );

		await waitFor( () => expect( window.location.search ).toBe( '' ) );
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );

	test( 'does not open the offer without the param', async () => {
		assignExperiment( 'no_time_to_build' );

		render( <DifmOfferDeepLink site={ mockSite } /> );
		// Let the stored assignment load before checking that nothing opened.
		await act( () => Promise.resolve() );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );
} );
