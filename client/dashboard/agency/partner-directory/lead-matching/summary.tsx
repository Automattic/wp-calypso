import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { useAnalytics } from '../../../app/analytics';
import ActionList from '../../../components/action-list';
import RouterLinkButton from '../../../components/router-link-button';
import { SectionHeader } from '../../../components/section-header';
import { getAvailableLanguages } from '../options';
import { PARTNER_DIRECTORY_LEAD_MATCHING_PREFERENCES_ROUTE } from '../paths';
import {
	REQUIRED_LEAD_MATCHING_FIELDS,
	getAnsweredRequiredFieldCount,
	getLeadMatchingFormData,
	type LeadMatchingFormData,
} from './form-data';
import {
	getBudgetLevelOptions,
	getBusinessTypeOptions,
	getCompanySizeOptions,
	getDecisionProcessOptions,
	getHostingEnvironmentOptions,
	getMigrationPlatformOptions,
	getMinimumBudgetOptions,
	getOngoingRelationshipOptions,
	getProjectTypeOptions,
	getRegionOptions,
	getServiceLevelOptions,
	getStoreComplexityOptions,
	getTimingPreferenceOptions,
} from './options';
import {
	LEAD_MATCHING_SECTIONS,
	getLeadMatchingSectionTitle,
	getLeadMatchingStatus,
	isSectionAnswered,
	type LeadMatchingSection,
	type LeadMatchingStatus,
} from './sections';
import type { Agency, AgencyLeadMatchingProfile } from '@automattic/api-core';
import type { ComponentProps } from 'react';

import './style.scss';

function getStatusCopy( status: LeadMatchingStatus, answered: number ) {
	const total = REQUIRED_LEAD_MATCHING_FIELDS.length;
	const copy: Record<
		LeadMatchingStatus,
		{
			intent: ComponentProps< typeof Badge >[ 'intent' ];
			badge: string;
			description: string;
		}
	> = {
		eligible: {
			intent: 'stable',
			badge: __( 'Eligible for leads' ),
			description: __( 'Your preferences are saved. You can update them anytime.' ),
		},
		'not-accepting': {
			intent: 'medium',
			badge: __( 'Not eligible' ),
			description: __( 'Turn on Accepting new clients to start receiving leads.' ),
		},
		'in-progress': {
			intent: 'informational',
			badge: sprintf(
				/* translators: %(answered)d is the number of answered questions and %(total)d is the number of questions. */
				__( '%(answered)d of %(total)d answered' ),
				{ answered, total }
			),
			description: __( 'Answer all questions to start receiving leads.' ),
		},
		'not-started': {
			intent: 'draft',
			badge: __( 'Not set up' ),
			description: sprintf(
				/* translators: %d is the number of questions. */
				__( 'Answer %d questions about your ideal clients to start receiving leads.' ),
				total
			),
		},
	};
	return copy[ status ];
}

// The option labels up to their first explanation, so a row stays short:
// "6–50: Small businesses…" reads "6–50".
const shortLabel = ( label: string ) => label.split( ' (' )[ 0 ].split( ': ' )[ 0 ];

const labelsOf = ( values: string[], options: Record< string, string > ) =>
	values
		.map( ( value ) => options[ value ] )
		.filter( Boolean )
		.map( shortLabel )
		.join( ', ' );

function getSectionAnswers( section: LeadMatchingSection, formData: LeadMatchingFormData ) {
	const parts: Record< Exclude< LeadMatchingSection, 'availability' >, string[] > = {
		'regions-and-languages': [
			labelsOf( formData.regions, getRegionOptions() ),
			labelsOf( formData.languages, getAvailableLanguages() ),
		],
		'business-details': [
			labelsOf( formData.businessTypes, getBusinessTypeOptions() ),
			labelsOf( formData.companySizes, getCompanySizeOptions() ),
		],
		'hosting-and-platforms': [
			labelsOf( formData.hostingEnvironments, getHostingEnvironmentOptions() ),
			labelsOf( formData.migrationPlatforms, getMigrationPlatformOptions() ),
			labelsOf( formData.storeComplexities, getStoreComplexityOptions() ),
		],
		'website-needs': [
			labelsOf( formData.projectTypes, getProjectTypeOptions() ),
			labelsOf( formData.serviceLevels, getServiceLevelOptions() ),
		],
		'budget-and-timeline': [
			labelsOf( formData.budgetLevels, getBudgetLevelOptions() ),
			labelsOf(
				formData.minimumBudget ? [ formData.minimumBudget ] : [],
				getMinimumBudgetOptions()
			),
			labelsOf( formData.timingPreferences, getTimingPreferenceOptions() ),
		],
		'decision-making': [ labelsOf( formData.decisionProcesses, getDecisionProcessOptions() ) ],
		'site-management': [
			labelsOf( formData.ongoingRelationships, getOngoingRelationshipOptions() ),
		],
	};

	if ( section === 'availability' ) {
		return '';
	}
	return parts[ section ].filter( Boolean ).join( ' · ' );
}

function getSectionDescription(
	section: LeadMatchingSection,
	formData: LeadMatchingFormData,
	isAvailable: boolean
) {
	if ( section === 'availability' ) {
		return isAvailable ? __( 'Accepting new clients' ) : __( 'Not accepting new clients' );
	}

	const answers = getSectionAnswers( section, formData );
	if ( ! answers ) {
		return section === 'hosting-and-platforms'
			? __( 'Optional, not answered' )
			: __( 'Not answered yet' );
	}
	if ( ! isSectionAnswered( section, formData ) ) {
		return __( 'Some questions not answered yet' );
	}
	return <span className="lead-matching-summary__answers">{ answers }</span>;
}

/**
 * The Lead matching tab: where the agency stands and what it answered, with
 * one way in to change the answers.
 */
export default function LeadMatchingSummary( {
	agency,
	profile,
}: {
	agency: Agency;
	profile: AgencyLeadMatchingProfile | null;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const isMobile = useViewportMatch( 'mobile', '<' );

	const formData = getLeadMatchingFormData( profile );
	const isAvailable = agency.profile?.listing_details?.is_available ?? true;
	const answered = getAnsweredRequiredFieldCount( formData );
	const status = getLeadMatchingStatus( formData, isAvailable );
	const copy = getStatusCopy( status, answered );

	return (
		<VStack spacing={ 8 }>
			<VStack spacing={ 4 }>
				<SectionHeader
					level={ 3 }
					title={ __( 'Get matched with clients' ) }
					description={ __(
						'Tell us which clients you want, and we’ll send you matching leads from Hire an Expert.'
					) }
				/>
				<ActionList>
					<ActionList.ActionItem
						layout={ isMobile ? 'stacked' : 'inline' }
						title={
							<HStack justify="flex-start" spacing={ 2 } as="span" wrap>
								<span>{ __( 'Lead matching' ) }</span>
								<Badge intent={ copy.intent }>{ copy.badge }</Badge>
							</HStack>
						}
						description={ copy.description }
						actions={
							<RouterLinkButton
								variant="primary"
								to={ PARTNER_DIRECTORY_LEAD_MATCHING_PREFERENCES_ROUTE }
								onClick={ () =>
									recordTracksEvent( 'calypso_a4a_partner_directory_lead_matching_status_click', {
										status,
									} )
								}
							>
								{ answered === 0 ? __( 'Set up preferences' ) : __( 'Update preferences' ) }
							</RouterLinkButton>
						}
					/>
				</ActionList>
			</VStack>

			<VStack spacing={ 4 }>
				<SectionHeader
					level={ 3 }
					title={ __( 'Your preferences' ) }
					description={ __( 'Clients answer the same questions in Hire an Expert.' ) }
				/>
				<ActionList>
					{ LEAD_MATCHING_SECTIONS.map( ( section ) => (
						<ActionList.ActionItem
							key={ section }
							title={ getLeadMatchingSectionTitle( section ) }
							description={ getSectionDescription( section, formData, isAvailable ) }
							actions={ null }
						/>
					) ) }
				</ActionList>
			</VStack>
		</VStack>
	);
}
