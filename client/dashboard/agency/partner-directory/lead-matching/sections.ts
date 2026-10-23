import { __ } from '@wordpress/i18n';
import {
	REQUIRED_LEAD_MATCHING_FIELDS,
	getAnsweredRequiredFieldCount,
	type LeadMatchingFormData,
	type RequiredLeadMatchingField,
} from './form-data';

export const LEAD_MATCHING_SECTIONS = [
	'availability',
	'regions-and-languages',
	'business-details',
	'hosting-and-platforms',
	'website-needs',
	'budget-and-timeline',
	'decision-making',
	'site-management',
] as const;

export type LeadMatchingSection = ( typeof LEAD_MATCHING_SECTIONS )[ number ];

export function getLeadMatchingSectionTitle( section: LeadMatchingSection ): string {
	switch ( section ) {
		case 'availability':
			return __( 'Your agency’s availability' );
		case 'regions-and-languages':
			return __( 'Regions and languages' );
		case 'business-details':
			return __( 'Business details' );
		case 'hosting-and-platforms':
			return __( 'Hosting and platforms' );
		case 'website-needs':
			return __( 'Website needs and vision' );
		case 'budget-and-timeline':
			return __( 'Project budget and timeline' );
		case 'decision-making':
			return __( 'Decision making' );
		case 'site-management':
			return __( 'Site management' );
	}
}

const SECTION_REQUIRED_FIELDS: Record< LeadMatchingSection, RequiredLeadMatchingField[] > = {
	availability: [],
	'regions-and-languages': [ 'regions', 'languages' ],
	'business-details': [ 'businessTypes', 'idealBusinessTypes', 'companySizes' ],
	'hosting-and-platforms': [],
	'website-needs': [ 'projectTypes', 'serviceLevels' ],
	'budget-and-timeline': [ 'budgetLevels', 'timingPreferences' ],
	'decision-making': [ 'decisionProcesses' ],
	'site-management': [ 'ongoingRelationships' ],
};

/**
 * Whether the saved preferences answer the section. The availability toggle
 * is saved on the public profile and always has a value; the hosting
 * questions are optional, so any answer counts.
 */
export function isSectionAnswered(
	section: LeadMatchingSection,
	formData: LeadMatchingFormData
): boolean {
	if ( section === 'availability' ) {
		return true;
	}

	if ( section === 'hosting-and-platforms' ) {
		return (
			formData.hostingEnvironments.length > 0 ||
			formData.migrationPlatforms.length > 0 ||
			formData.storeComplexities.length > 0
		);
	}

	return SECTION_REQUIRED_FIELDS[ section ].every( ( field ) => formData[ field ].length > 0 );
}

export type LeadMatchingStatus = 'not-accepting' | 'not-started' | 'in-progress' | 'eligible';

/**
 * Agencies not accepting new clients get no leads, whatever they answered.
 */
export function getLeadMatchingStatus(
	formData: LeadMatchingFormData,
	isAcceptingClients: boolean
): LeadMatchingStatus {
	if ( ! isAcceptingClients ) {
		return 'not-accepting';
	}

	const answered = getAnsweredRequiredFieldCount( formData );

	if ( answered === REQUIRED_LEAD_MATCHING_FIELDS.length ) {
		return 'eligible';
	}

	return answered === 0 ? 'not-started' : 'in-progress';
}
