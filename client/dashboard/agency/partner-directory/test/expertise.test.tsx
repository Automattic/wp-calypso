/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import AgencyPartnerDirectoryExpertise from '../expertise';
import PartnerDirectoryExpertiseContent from '../expertise/expertise-content';
import type { AgencyPartnerDirectoryApplication, AgencyProfile } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';

function makeProfile(
	application: AgencyPartnerDirectoryApplication | null = null
): AgencyProfile {
	return {
		company_details: {
			name: 'Test Agency',
			email: 'test@example.com',
			website: 'https://example.com',
			bio_description: 'We build sites.',
			logo_url: '',
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
		partner_directory_application: application,
	};
}

function makeApplication(): AgencyPartnerDirectoryApplication {
	return {
		status: 'in-progress',
		directories: [
			{
				status: 'approved',
				directory: 'wordpress',
				urls: [
					'https://one.example.com',
					'https://two.example.com',
					'https://three.example.com',
					'https://four.example.com',
					'https://five.example.com',
				],
				note: '',
				is_published: true,
			},
		],
		feedback_url: 'https://example.com/reviews',
		is_published: true,
	};
}

function mockAgency( application: AgencyPartnerDirectoryApplication | null = null ) {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: 123, name: 'Test Agency', profile: makeProfile( application ) } ] )
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

describe( '<AgencyPartnerDirectoryExpertise>', () => {
	test( 'invites a new agency to submit an application', async () => {
		mockAgency();

		render( <AgencyPartnerDirectoryExpertise /> );

		expect( await screen.findByRole( 'button', { name: 'Submit my application' } ) ).toBeVisible();
		expect( screen.getByRole( 'checkbox', { name: 'WordPress.com' } ) ).not.toBeChecked();
		expect( screen.getByRole( 'link', { name: 'Cancel' } ) ).toBeVisible();
	} );

	test( 'shows validation errors when submitting an empty form', async () => {
		mockAgency();

		render( <AgencyPartnerDirectoryExpertise /> );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Submit my application' } ) );

		expect( screen.getByText( 'Services can’t be empty' ) ).toBeVisible();
		expect( screen.getByText( 'Products can’t be empty' ) ).toBeVisible();
		expect( screen.getByText( 'Directories can’t be empty' ) ).toBeVisible();
		expect( screen.getByText( 'Feedback URL can’t be empty' ) ).toBeVisible();
	} );

	test( 'requires client site URLs for newly selected directories', async () => {
		mockAgency( makeApplication() );

		render( <AgencyPartnerDirectoryExpertise /> );

		// Approved directories can't be unselected.
		expect( await screen.findByRole( 'checkbox', { name: 'WordPress.com' } ) ).toBeDisabled();

		await userEvent.click( screen.getByRole( 'checkbox', { name: 'Pressable.com' } ) );
		expect( screen.getByText( 'Relevant examples for Pressable.com' ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Update my expertise' } ) );
		expect( screen.getByText( 'Please provide valid URLs' ) ).toBeVisible();
	} );

	test( 'submits the application and reports the saved agency back', async () => {
		const application = makeApplication();
		const updatedAgency = { id: 123, name: 'Test Agency', profile: makeProfile( application ) };
		const scope = nock( API )
			.put( '/wpcom/v2/agency/123/profile/application' )
			.reply( 200, updatedAgency );

		const onSubmitSuccess = jest.fn();

		render(
			<PartnerDirectoryExpertiseContent
				agency={ { id: 123, profile: makeProfile( application ) } }
				recordTracksEvent={ jest.fn() }
				dashboardUrl="/agency/partner-directory"
				onSubmitSuccess={ onSubmitSuccess }
			/>
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Update my expertise' } ) );

		await waitFor( () => expect( onSubmitSuccess ).toHaveBeenCalled() );
		expect( scope.isDone() ).toBe( true );
	} );
} );
