/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import AgencyPartnerDirectory from '../index';
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

function mockAgency( application: AgencyPartnerDirectoryApplication | null = null ) {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: 123, name: 'Test Agency', profile: makeProfile( application ) } ] )
		.persist();
}

function mockPreferences( preferences: Record< string, unknown > = {} ) {
	nock( API )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: preferences } )
		.persist();
}

describe( '<AgencyPartnerDirectory>', () => {
	test( 'invites the agency to apply when no application was submitted', async () => {
		mockAgency( null );

		render( <AgencyPartnerDirectory /> );

		expect(
			await screen.findByRole( 'heading', {
				name: 'Boost your agency’s visibility across Automattic listings.',
			} )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Apply now' } ) ).toBeVisible();
	} );

	test( 'shows the per-directory status once the application was submitted', async () => {
		mockAgency( {
			status: 'pending',
			directories: [ { directory: 'wordpress', status: 'pending', urls: [], note: '' } ],
			feedback_url: '',
			is_published: false,
		} );

		render( <AgencyPartnerDirectory /> );

		expect( await screen.findByRole( 'link', { name: 'Edit expertise' } ) ).toBeVisible();
		expect( screen.getByText( 'Pending' ) ).toBeVisible();
		expect( screen.getByText( 'WordPress.com' ) ).toBeVisible();
	} );

	test( 'opens the update-expertise popover when a directory was rejected', async () => {
		mockAgency( {
			status: 'pending',
			directories: [ { directory: 'wordpress', status: 'rejected', urls: [], note: '' } ],
			feedback_url: '',
			is_published: false,
		} );
		mockPreferences();

		render( <AgencyPartnerDirectory /> );

		expect( await screen.findByText( 'Not approved' ) ).toBeVisible();
		await waitFor( () =>
			expect(
				screen.getByText(
					'Your agency wasn’t approved. Please check your email for feedback from our review team.'
				)
			).toBeVisible()
		);
		expect( screen.getByRole( 'link', { name: 'Update my expertise' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'I’ll do it later' } ) ).toBeVisible();
	} );

	test( 'keeps the popover closed when it was dismissed before', async () => {
		mockAgency( {
			status: 'pending',
			directories: [ { directory: 'wordpress', status: 'rejected', urls: [], note: '' } ],
			feedback_url: '',
			is_published: false,
		} );
		mockPreferences( { 'a4a-partner-directory-dashboard-not-approved-popover': true } );

		render( <AgencyPartnerDirectory /> );

		expect( await screen.findByText( 'Not approved' ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Update my expertise' } ) ).not.toBeInTheDocument();
	} );

	test( 'congratulates the agency when a directory listing is approved and published', async () => {
		mockAgency( {
			status: 'completed',
			directories: [
				{ directory: 'wordpress', status: 'approved', urls: [], note: '', is_published: true },
			],
			feedback_url: '',
			is_published: true,
		} );

		render( <AgencyPartnerDirectory /> );

		expect(
			await screen.findByRole( 'heading', {
				name: 'Congratulations! Your agency is now listed in our Partner Directory.',
			} )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Your agency’s profile/ } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Edit profile' } ) ).toBeVisible();
	} );
} );
