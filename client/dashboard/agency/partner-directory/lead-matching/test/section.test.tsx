/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { select } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { getEmptyLeadMatchingFormData, getLeadMatchingProfile } from '../form-data';
import AgencyPartnerDirectoryLeadMatchingSection from '../section';
import type { AgencyLeadMatchingProfile, AgencyProfile } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';

function makeAgencyProfile( isAvailable = true ): AgencyProfile {
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
			is_available: isAvailable,
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
		partner_directory_application: {
			status: 'completed',
			directories: [ { directory: 'wordpress', status: 'approved', is_published: true } ],
			is_published: true,
		},
	} as AgencyProfile;
}

const completeProfile = getLeadMatchingProfile(
	{
		...getEmptyLeadMatchingFormData(),
		regions: [ 'emea' ],
		languages: [ 'en' ],
		businessTypes: [ 'local_service' ],
		idealBusinessTypes: [ 'content_media' ],
		companySizes: [ 'size_1_5' ],
		projectTypes: [ 'new_website' ],
		serviceLevels: [ 'enhanced' ],
		budgetLevels: [ 'mid_range' ],
		timingPreferences: [ 'flexible' ],
		decisionProcesses: [ 'individual' ],
		ongoingRelationships: [ 'training' ],
	},
	null,
	true
);

function mockAgency( isAvailable = true ) {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: 123, name: 'Test Agency', profile: makeAgencyProfile( isAvailable ) } ] )
		.persist();
}

function mockLeadMatching( profile: AgencyLeadMatchingProfile | null ) {
	nock( API )
		.get( '/wpcom/v2/agency/123/lead-matching' )
		.query( true )
		.reply( 200, { agency_id: 123, lead_matching_profile: profile, sync: { status: 'synced' } } )
		.persist();
}

beforeAll( () => {
	window.HTMLElement.prototype.scrollIntoView = jest.fn();
} );

describe( '<AgencyPartnerDirectoryLeadMatchingSection>', () => {
	test( 'shows the section’s required questions when saving without answers', async () => {
		mockAgency();
		mockLeadMatching( null );

		render( <AgencyPartnerDirectoryLeadMatchingSection section="website-needs" /> );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Save' } ) );

		expect( screen.getByText( 'Please select at least one project type' ) ).toBeVisible();
		expect( screen.getByText( 'Please select at least one service level' ) ).toBeVisible();
	} );

	test( 'saves the whole profile with the section’s answers', async () => {
		mockAgency();
		mockLeadMatching( completeProfile );

		let savedProfile: AgencyLeadMatchingProfile | undefined;
		const scope = nock( API )
			.put( '/wpcom/v2/agency/123/lead-matching', ( body ) => {
				savedProfile = body;
				return true;
			} )
			.query( true )
			.reply( 200, ( _uri, body ) => ( {
				agency_id: 123,
				lead_matching_profile: body,
				sync: { status: 'synced' },
			} ) );

		render( <AgencyPartnerDirectoryLeadMatchingSection section="website-needs" /> );

		const select = await screen.findByRole( 'combobox', {
			name: 'Which max service level are you most comfortable with right now?',
		} );
		await userEvent.selectOptions( select, 'premium' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Save' } ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( savedProfile?.service_and_budget.max_service_level ).toBe( 'premium' );
		expect( savedProfile?.geography_and_language.supported_regions ).toEqual( [ 'emea' ] );
		expect( savedProfile?.availability.accepting_work ).toBe( true );
	} );

	test( 'reports a failed sync as an error', async () => {
		mockAgency();
		mockLeadMatching( completeProfile );
		nock( API )
			.put( '/wpcom/v2/agency/123/lead-matching' )
			.query( true )
			.reply( 200, {
				agency_id: 123,
				lead_matching_profile: completeProfile,
				sync: { status: 'failed' },
			} );

		render( <AgencyPartnerDirectoryLeadMatchingSection section="decision-making" /> );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Save' } ) );

		await waitFor( () =>
			expect(
				select( noticesStore )
					.getNotices()
					.map( ( { content } ) => content )
			).toContain( 'Something went wrong saving your preferences.' )
		);
	} );

	test( 'saves the availability on the public profile only', async () => {
		mockAgency();
		mockLeadMatching( completeProfile );

		let isAvailable: boolean | undefined;
		const scope = nock( API )
			.put( '/wpcom/v2/agency/123/profile', ( body ) => {
				isAvailable = body.profile_listing_is_available;
				return true;
			} )
			.query( true )
			.reply( 200, { id: 123, profile: makeAgencyProfile( false ) } );
		const leadMatchingScope = nock( API )
			.put( '/wpcom/v2/agency/123/lead-matching' )
			.query( true )
			.reply( 200, {} );

		render( <AgencyPartnerDirectoryLeadMatchingSection section="availability" /> );

		const toggle = await screen.findByRole( 'checkbox', { name: 'Accepting new clients' } );
		expect( toggle ).toBeChecked();
		await userEvent.click( toggle );
		await userEvent.click( screen.getByRole( 'button', { name: 'Save' } ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( isAvailable ).toBe( false );
		expect( leadMatchingScope.isDone() ).toBe( false );
	} );

	test( 'shows the section title as the page title', async () => {
		mockAgency();
		mockLeadMatching( null );

		render( <AgencyPartnerDirectoryLeadMatchingSection section="budget-and-timeline" /> );

		expect(
			await screen.findByRole( 'heading', { name: 'Project budget and timeline' } )
		).toBeVisible();
	} );
} );
