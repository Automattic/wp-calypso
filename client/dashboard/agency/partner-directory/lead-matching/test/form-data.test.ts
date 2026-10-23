import {
	getAnsweredRequiredFieldCount,
	getEmptyLeadMatchingFormData,
	getLeadMatchingFormData,
	getLeadMatchingProfile,
	type LeadMatchingFormData,
} from '../form-data';
import type { AgencyLeadMatchingProfile } from '@automattic/api-core';

function makeFormData( fields: Partial< LeadMatchingFormData > = {} ): LeadMatchingFormData {
	return {
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
		ongoingRelationships: [ 'care_plans', 'technical_teams' ],
		...fields,
	};
}

describe( 'lead matching form data', () => {
	test( 'round-trips the answers through the stored profile', () => {
		const formData = makeFormData( {
			supportsGlobal: true,
			hostingEnvironments: [ 'wpcom' ],
			minimumBudget: '3k_10k',
			requiresMaintenance: true,
		} );

		const profile = getLeadMatchingProfile( formData, null, true );

		expect( getLeadMatchingFormData( profile ) ).toEqual( formData );
	} );

	test( 'maps the single service level and the relationship flags', () => {
		const profile = getLeadMatchingProfile( makeFormData(), null, true );

		expect( profile.service_and_budget.max_service_level ).toBe( 'enhanced' );
		expect( profile.delivery_model ).toMatchObject( {
			offers_care_plans: true,
			trains_clients: false,
			works_with_internal_technical_teams: true,
		} );
	} );

	test( 'derives the ecommerce flags from project types and store complexities', () => {
		const wooOnly = getLeadMatchingProfile(
			makeFormData( { projectTypes: [ 'new_woocommerce' ] } ),
			null,
			true
		);
		expect( wooOnly.ecommerce ).toMatchObject( {
			supports_ecommerce_projects: true,
			ecommerce_focus: false,
		} );

		const withComplexity = getLeadMatchingProfile(
			makeFormData( { storeComplexities: [ 'traffic_spikes' ] } ),
			null,
			true
		);
		expect( withComplexity.ecommerce ).toMatchObject( {
			supports_ecommerce_projects: true,
			ecommerce_focus: true,
		} );
	} );

	test( 'keeps the eligibility fields of the saved profile', () => {
		const previous = getLeadMatchingProfile( makeFormData(), null, true );
		previous.availability.lead_eligibility = 'suspended';
		previous.availability.profile_v2_complete = false;

		const profile = getLeadMatchingProfile( makeFormData(), previous, false );

		expect( profile.availability ).toEqual( {
			accepting_work: false,
			lead_eligibility: 'suspended',
			profile_v2_complete: false,
		} );
	} );

	test( 'marks a first complete save as a complete profile', () => {
		expect(
			getLeadMatchingProfile( makeFormData(), null, true ).availability.profile_v2_complete
		).toBe( true );
		expect(
			getLeadMatchingProfile( makeFormData( { regions: [] } ), null, true ).availability
				.profile_v2_complete
		).toBe( false );
	} );

	test( 'drops unknown answers from closed option lists only', () => {
		const profile = getLeadMatchingProfile( makeFormData(), null, true );
		const stored: AgencyLeadMatchingProfile = {
			...profile,
			geography_and_language: {
				...profile.geography_and_language,
				supported_regions: [ 'emea', 'mars' ],
			},
			business_fit: {
				...profile.business_fit,
				supported_business_types: [ 'local_service', 'retired_type' ],
			},
			service_and_budget: { ...profile.service_and_budget, minimum_budget_band: 'free' },
		};

		const formData = getLeadMatchingFormData( stored );

		expect( formData.regions ).toEqual( [ 'emea', 'mars' ] );
		expect( formData.businessTypes ).toEqual( [ 'local_service' ] );
		expect( formData.minimumBudget ).toBe( '' );
	} );

	test( 'counts the answered required questions', () => {
		expect( getAnsweredRequiredFieldCount( getEmptyLeadMatchingFormData() ) ).toBe( 0 );
		expect( getAnsweredRequiredFieldCount( makeFormData() ) ).toBe( 11 );
		expect(
			getAnsweredRequiredFieldCount( makeFormData( { serviceLevels: [], languages: [] } ) )
		).toBe( 9 );
	} );
} );
