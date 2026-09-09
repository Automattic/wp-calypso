/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import AgencyPartnerDirectoryDetails from '../details';
import PartnerDirectoryDetailsContent from '../details/details-content';
import type { AgencyProfile } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';

function makeProfile(): AgencyProfile {
	return {
		company_details: {
			name: 'Test Agency',
			email: 'test@example.com',
			website: 'https://example.com',
			bio_description: 'We build sites.',
			logo_url: 'https://example.com/logo.png',
			landing_page_url: '',
			country: 'US',
		},
		listing_details: {
			is_available: true,
			is_global: false,
			industries: [ 'technology_and_it_services' ],
			services: [ 'seo' ],
			products: [ 'wordpress_com' ],
			languages_spoken: [ 'en' ],
		},
		budget_details: {
			budget_lower_range: '0',
			budget_upper_range: '',
			has_hourly_rate: false,
			hourly_rate_value: '',
		},
		partner_directory_application: null,
	};
}

function mockAgency( profile: AgencyProfile | null = null ) {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: 123, name: 'Test Agency', profile } ] )
		.persist();
}

function mockCountryRegions() {
	nock( API )
		.get( '/wpcom/v2/woocommerce/countries/regions/' )
		.query( true )
		.reply( 200, { US: 'United States (US)', 'US:TX': 'United States (US) — Texas' } )
		.persist();
}

beforeAll( () => {
	// jsdom doesn't implement scrollIntoView, which the form calls when
	// validation fails on the fields above the fold.
	window.HTMLElement.prototype.scrollIntoView = jest.fn();
} );

beforeEach( () => {
	nock.cleanAll();
} );

describe( '<AgencyPartnerDirectoryDetails>', () => {
	test( 'shows validation errors when saving an empty profile', async () => {
		mockAgency();
		mockCountryRegions();

		render( <AgencyPartnerDirectoryDetails /> );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Save public profile' } ) );

		expect( screen.getByText( 'Company name can’t be empty' ) ).toBeVisible();
		expect( screen.getByText( 'Email can’t be empty' ) ).toBeVisible();
		expect( screen.getByText( 'Website can’t be empty' ) ).toBeVisible();
		expect( screen.getByText( 'Bio description can’t be empty' ) ).toBeVisible();
		expect( screen.getByText( 'Company location can’t be empty' ) ).toBeVisible();
		expect( screen.getByText( 'Please provide industries' ) ).toBeVisible();
	} );

	test( 'prefills the form from the saved profile', async () => {
		mockAgency( makeProfile() );
		mockCountryRegions();

		render( <AgencyPartnerDirectoryDetails /> );

		expect( await screen.findByRole( 'textbox', { name: 'Company name' } ) ).toHaveValue(
			'Test Agency'
		);
		expect( screen.getByRole( 'textbox', { name: 'Company email' } ) ).toHaveValue(
			'test@example.com'
		);
	} );

	test( 'saves the profile and reports the saved agency back', async () => {
		mockCountryRegions();
		const updatedAgency = { id: 123, name: 'Test Agency', profile: makeProfile() };
		const scope = nock( API ).put( '/wpcom/v2/agency/123/profile' ).reply( 200, updatedAgency );

		const onSubmitSuccess = jest.fn();

		render(
			<PartnerDirectoryDetailsContent
				agency={ { id: 123, profile: makeProfile() } }
				recordTracksEvent={ jest.fn() }
				onSubmitSuccess={ onSubmitSuccess }
			/>
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Save public profile' } ) );

		await waitFor( () => expect( onSubmitSuccess ).toHaveBeenCalled() );
		expect( scope.isDone() ).toBe( true );
	} );
} );
