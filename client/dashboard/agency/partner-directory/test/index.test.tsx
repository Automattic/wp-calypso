/**
 * @vitest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

		expect( await screen.findByRole( 'heading', { name: 'How do I start?' } ) ).toBeVisible();
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

	test( 'names the rejected directory in a notice', async () => {
		mockAgency( {
			status: 'pending',
			directories: [
				{ directory: 'wordpress', status: 'rejected', urls: [], note: '' },
				{ directory: 'pressable', status: 'pending', urls: [], note: '' },
			],
			feedback_url: '',
			is_published: false,
		} );
		mockPreferences();

		render( <AgencyPartnerDirectory /> );

		expect(
			await screen.findByText( 'Your agency wasn’t approved for WordPress.com.' )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Update my expertise' } ) ).toBeVisible();
	} );

	test( 'shows the notice when more than one directory was rejected', async () => {
		mockAgency( {
			status: 'pending',
			directories: [
				{ directory: 'wordpress', status: 'rejected', urls: [], note: '' },
				{ directory: 'pressable', status: 'rejected', urls: [], note: '' },
			],
			feedback_url: '',
			is_published: false,
		} );
		mockPreferences();

		render( <AgencyPartnerDirectory /> );

		expect(
			await screen.findByText( 'Your agency wasn’t approved for 2 directories.' )
		).toBeVisible();
	} );

	test( 'saves the dismissal when the notice is closed', async () => {
		mockAgency( {
			status: 'pending',
			directories: [ { directory: 'wordpress', status: 'rejected', urls: [], note: '' } ],
			feedback_url: '',
			is_published: false,
		} );
		mockPreferences();
		const saved = new Promise< void >( ( resolve ) => {
			nock( API )
				.post( '/rest/v1.1/me/preferences', ( body ) => {
					if ( body.calypso_preferences?.[ 'a4a-dashboard-pd-not-approved-popover' ] === true ) {
						resolve();
						return true;
					}
					return false;
				} )
				.query( true )
				.reply( 200, { calypso_preferences: { 'a4a-dashboard-pd-not-approved-popover': true } } );
		} );

		render( <AgencyPartnerDirectory /> );

		await screen.findByText( 'Your agency wasn’t approved for WordPress.com.' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );

		await saved;
		await waitFor( () =>
			expect(
				screen.queryByText( 'Your agency wasn’t approved for WordPress.com.' )
			).not.toBeInTheDocument()
		);
	} );

	test( 'keeps the notice hidden when it was dismissed before', async () => {
		mockAgency( {
			status: 'pending',
			directories: [ { directory: 'wordpress', status: 'rejected', urls: [], note: '' } ],
			feedback_url: '',
			is_published: false,
		} );
		mockPreferences( { 'a4a-dashboard-pd-not-approved-popover': true } );

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
