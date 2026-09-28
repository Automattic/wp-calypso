/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import nock from 'nock';
import AgencyPartnerDirectoryLeadMatching from '..';
import { render } from '../../../../test-utils';
import { getEmptyLeadMatchingFormData, getLeadMatchingProfile } from '../form-data';
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

describe( '<AgencyPartnerDirectoryLeadMatching>', () => {
	test( 'shows the tabs and a not set up status without preferences', async () => {
		mockAgency();
		mockLeadMatching( null );

		render( <AgencyPartnerDirectoryLeadMatching /> );

		expect( await screen.findByRole( 'tab', { name: 'Lead matching' } ) ).toHaveAttribute(
			'aria-selected',
			'true'
		);
		expect( screen.getByRole( 'tab', { name: 'Overview' } ) ).toBeVisible();
		expect( await screen.findByText( 'Not set up' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Get started' } ) ).toHaveAttribute(
			'href',
			'/agency/partner-directory/lead-matching/regions-and-languages'
		);
		expect( screen.getAllByText( 'Not answered yet' ) ).toHaveLength( 7 );
	} );

	test( 'counts answers and continues at the first unanswered section', async () => {
		mockAgency();
		mockLeadMatching( {
			...completeProfile,
			project_types: { ...completeProfile.project_types, supported_project_types: [] },
			service_and_budget: { ...completeProfile.service_and_budget, max_service_level: '' },
		} );

		render( <AgencyPartnerDirectoryLeadMatching /> );

		expect( await screen.findByText( '9 of 11 answered' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Continue' } ) ).toHaveAttribute(
			'href',
			'/agency/partner-directory/lead-matching/website-needs'
		);
	} );

	test( 'is eligible with every answer while accepting clients', async () => {
		mockAgency();
		mockLeadMatching( completeProfile );

		render( <AgencyPartnerDirectoryLeadMatching /> );

		expect( await screen.findByText( 'Eligible for leads' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Edit preferences' } ) ).toBeVisible();
	} );

	test( 'is not eligible while not accepting clients', async () => {
		mockAgency( false );
		mockLeadMatching( completeProfile );

		render( <AgencyPartnerDirectoryLeadMatching /> );

		expect( await screen.findByText( 'Not eligible' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Update availability' } ) ).toHaveAttribute(
			'href',
			'/agency/partner-directory/lead-matching/availability'
		);
	} );
} );
