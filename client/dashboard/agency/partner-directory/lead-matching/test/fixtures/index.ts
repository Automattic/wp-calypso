import nock from 'nock';
import { getEmptyLeadMatchingFormData, getLeadMatchingProfile } from '../../form-data';
import type { AgencyLeadMatchingProfile, AgencyProfile } from '@automattic/api-core';

export const API = 'https://public-api.wordpress.com';

export function makeAgencyProfile( isAvailable = true ): AgencyProfile {
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

export const completeProfile = getLeadMatchingProfile(
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

export const incompleteProfile = {
	...completeProfile,
	availability: { ...completeProfile.availability, accepting_work: false },
	service_and_budget: { ...completeProfile.service_and_budget, max_service_level: '' },
};

export function mockAgency( isAvailable = true ) {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: 123, name: 'Test Agency', profile: makeAgencyProfile( isAvailable ) } ] )
		.persist();
}

export function mockLeadMatching( profile: AgencyLeadMatchingProfile | null ) {
	nock( API )
		.get( '/wpcom/v2/agency/123/lead-matching' )
		.query( true )
		.reply( 200, { agency_id: 123, lead_matching_profile: profile, sync: { status: 'synced' } } )
		.persist();
}

export function mockLeadMatchingSave(
	onBody: ( body: AgencyLeadMatchingProfile ) => void = () => {}
) {
	return nock( API )
		.put( '/wpcom/v2/agency/123/lead-matching', ( body ) => {
			onBody( body );
			return true;
		} )
		.query( true )
		.reply( 200, ( _uri, body ) => ( {
			agency_id: 123,
			lead_matching_profile: body,
			sync: { status: 'synced' },
		} ) );
}

export function mockProfileSave( onBody: ( body: Record< string, unknown > ) => void = () => {} ) {
	return nock( API )
		.put( '/wpcom/v2/agency/123/profile', ( body ) => {
			onBody( body );
			return true;
		} )
		.query( true )
		.reply( 200, ( _uri, body ) => ( {
			id: 123,
			profile: makeAgencyProfile(
				( body as { profile_listing_is_available: boolean } ).profile_listing_is_available
			),
		} ) );
}
