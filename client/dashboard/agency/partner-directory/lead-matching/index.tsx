import { activeAgencyQuery, agencyLeadMatchingQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { useEffect } from 'react';
import { useAnalytics } from '../../../app/analytics';
import ActionList from '../../../components/action-list';
import RouterLinkButton from '../../../components/router-link-button';
import { SectionHeader } from '../../../components/section-header';
import PartnerDirectoryPage from '../partner-directory-page';
import { getLeadMatchingSectionRoute } from '../paths';
import {
	REQUIRED_LEAD_MATCHING_FIELDS,
	getAnsweredRequiredFieldCount,
	getLeadMatchingFormData,
} from './form-data';
import {
	LEAD_MATCHING_SECTIONS,
	getLeadMatchingSectionTitle,
	getLeadMatchingStatus,
	getNextSectionToAnswer,
	isSectionAnswered,
	type LeadMatchingStatus,
} from './sections';
import type { ComponentProps } from 'react';

interface StatusCopy {
	badge: { intent: ComponentProps< typeof Badge >[ 'intent' ]; label: string };
	description: string;
	action: string;
}

function getStatusCopy( status: LeadMatchingStatus, answered: number ): StatusCopy {
	const total = REQUIRED_LEAD_MATCHING_FIELDS.length;

	switch ( status ) {
		case 'eligible':
			return {
				badge: { intent: 'stable', label: __( 'Eligible for leads' ) },
				description: __( 'Your preferences are saved. You can update them anytime.' ),
				action: __( 'Edit preferences' ),
			};
		case 'not-accepting':
			return {
				badge: { intent: 'medium', label: __( 'Not eligible' ) },
				description: __(
					'Turn on Accepting new clients to be included in lead matching and receive leads.'
				),
				action: __( 'Update availability' ),
			};
		case 'in-progress':
			return {
				badge: {
					intent: 'informational',
					label: sprintf(
						/* translators: %(answered)d is the number of answered questions and %(total)d is the number of questions. */
						__( '%(answered)d of %(total)d answered' ),
						{ answered, total }
					),
				},
				description: __( 'Answer all questions to start receiving leads.' ),
				action: __( 'Continue' ),
			};
		case 'not-started':
			return {
				badge: { intent: 'draft', label: __( 'Not set up' ) },
				description: sprintf(
					/* translators: %d is the number of questions. */
					__( 'Answer %d questions about the clients you want to start receiving leads.' ),
					total
				),
				action: __( 'Get started' ),
			};
	}
}

export default function AgencyPartnerDirectoryLeadMatching() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { data: leadMatching } = useQuery( agencyLeadMatchingQuery( agency?.id ?? 0 ) );
	const { recordTracksEvent } = useAnalytics();
	const isMobile = useViewportMatch( 'mobile', '<' );

	useEffect( () => {
		recordTracksEvent( 'calypso_a4a_partner_directory_lead_matching_view' );
	}, [ recordTracksEvent ] );

	const profile = leadMatching?.lead_matching_profile;
	const formData = getLeadMatchingFormData( profile );
	const isAcceptingClients = agency?.profile?.listing_details?.is_available ?? true;
	const status = getLeadMatchingStatus( formData, isAcceptingClients );
	const copy = getStatusCopy( status, getAnsweredRequiredFieldCount( formData ) );

	const actionSection =
		status === 'not-accepting'
			? 'availability'
			: ( getNextSectionToAnswer( formData ) ?? LEAD_MATCHING_SECTIONS[ 0 ] );

	return (
		<PartnerDirectoryPage tab="lead-matching">
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
									<Badge intent={ copy.badge.intent }>{ copy.badge.label }</Badge>
								</HStack>
							}
							description={ copy.description }
							actions={
								<RouterLinkButton
									variant="primary"
									to={ getLeadMatchingSectionRoute( actionSection ) }
									onClick={ () =>
										recordTracksEvent( 'calypso_a4a_partner_directory_lead_matching_status_click', {
											status,
										} )
									}
								>
									{ copy.action }
								</RouterLinkButton>
							}
						/>
					</ActionList>
				</VStack>

				<VStack spacing={ 4 }>
					<SectionHeader
						level={ 3 }
						title={ __( 'Your preferences' ) }
						description={ __(
							'Each section matches a question clients answer in Hire an Expert.'
						) }
					/>
					<ActionList>
						{ LEAD_MATCHING_SECTIONS.map( ( section ) => {
							const isAnswered = isSectionAnswered( section, formData );

							return (
								<ActionList.ActionItem
									key={ section }
									title={ getLeadMatchingSectionTitle( section ) }
									description={ isAnswered ? __( 'Answered' ) : __( 'Not answered yet' ) }
									actions={
										<RouterLinkButton variant="link" to={ getLeadMatchingSectionRoute( section ) }>
											{ isAnswered ? __( 'Edit' ) : __( 'Answer' ) }
										</RouterLinkButton>
									}
								/>
							);
						} ) }
					</ActionList>
				</VStack>
			</VStack>
		</PartnerDirectoryPage>
	);
}
