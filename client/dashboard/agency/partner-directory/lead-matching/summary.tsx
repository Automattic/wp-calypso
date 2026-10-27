import { isEnabled } from '@automattic/calypso-config';
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
import { Text } from '../../../components/text';
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

interface StatusCopy {
	intent: ComponentProps< typeof Badge >[ 'intent' ];
	badge: string;
	description: string;
}

function getStatusCopy( status: LeadMatchingStatus, answered: number ): StatusCopy {
	const total = REQUIRED_LEAD_MATCHING_FIELDS.length;

	switch ( status ) {
		case 'eligible':
			return {
				intent: 'stable',
				badge: __( 'Eligible for leads' ),
				description: __( 'Your preferences are saved. You can update them anytime.' ),
			};
		case 'not-accepting':
			return {
				intent: 'medium',
				badge: __( 'Not eligible' ),
				description: __( 'Turn on “Accepting new clients” to start receiving leads.' ),
			};
		case 'in-progress':
			return {
				intent: 'informational',
				badge: sprintf(
					/* translators: %(answered)d is the number of answered questions and %(total)d is the number of questions. */
					__( '%(answered)d of %(total)d answered' ),
					{ answered, total }
				),
				description: __( 'Answer all questions to start receiving leads.' ),
			};
		case 'not-started':
			return {
				intent: 'draft',
				badge: __( 'Not set up' ),
				description: sprintf(
					/* translators: %d is the number of questions. */
					__( 'Answer %d questions about your ideal clients to start receiving leads.' ),
					total
				),
			};
	}
}

const labelsOf = ( values: string[], options: Record< string, string > ) =>
	values.flatMap( ( value ) => ( options[ value ] ? [ options[ value ] ] : [] ) ).join( ', ' );

const joinParts = ( parts: string[] ) => parts.filter( Boolean ).join( ' · ' );

function getSectionAnswers(
	section: Exclude< LeadMatchingSection, 'availability' >,
	formData: LeadMatchingFormData
): string {
	switch ( section ) {
		case 'regions-and-languages':
			return joinParts( [
				labelsOf( formData.regions, getRegionOptions() ),
				labelsOf( formData.languages, getAvailableLanguages() ),
			] );
		case 'business-details':
			return joinParts( [
				labelsOf( formData.businessTypes, getBusinessTypeOptions() ),
				labelsOf( formData.idealBusinessTypes, getBusinessTypeOptions() ),
				labelsOf( formData.companySizes, getCompanySizeOptions() ),
			] );
		case 'hosting-and-platforms':
			return joinParts( [
				labelsOf( formData.hostingEnvironments, getHostingEnvironmentOptions() ),
				labelsOf( formData.migrationPlatforms, getMigrationPlatformOptions() ),
				labelsOf( formData.storeComplexities, getStoreComplexityOptions() ),
			] );
		case 'website-needs':
			return joinParts( [
				labelsOf( formData.projectTypes, getProjectTypeOptions() ),
				labelsOf( formData.serviceLevels, getServiceLevelOptions() ),
			] );
		case 'budget-and-timeline':
			return joinParts( [
				labelsOf( formData.budgetLevels, getBudgetLevelOptions() ),
				labelsOf( [ formData.minimumBudget ], getMinimumBudgetOptions() ),
				labelsOf( formData.timingPreferences, getTimingPreferenceOptions() ),
			] );
		case 'decision-making':
			return labelsOf( formData.decisionProcesses, getDecisionProcessOptions() );
		case 'site-management':
			return labelsOf( formData.ongoingRelationships, getOngoingRelationshipOptions() );
	}
}

function getSectionDescription(
	section: LeadMatchingSection,
	formData: LeadMatchingFormData,
	isAvailable: boolean
): string {
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
	return answers;
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
	const previewSearch = isEnabled( 'a4a-lead-matching-contact-preview' )
		? {
				flags:
					new URLSearchParams( window.location.search.replace( /\+/g, '%2B' ) ).get( 'flags' ) ??
					'a4a-lead-matching-contact-preview',
			}
		: undefined;

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
								search={ previewSearch }
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
							description={
								<Text variant="muted" truncate numberOfLines={ 1 }>
									{ getSectionDescription( section, formData, isAvailable ) }
								</Text>
							}
							actions={ null }
						/>
					) ) }
				</ActionList>
			</VStack>
		</VStack>
	);
}
