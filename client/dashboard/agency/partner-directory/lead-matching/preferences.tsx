import {
	activeAgencyQuery,
	agencyLeadMatchingMutation,
	agencyLeadMatchingQuery,
	agencyProfileMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button, ToggleControl, __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { Fragment, useMemo, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import Breadcrumbs from '../../../app/breadcrumbs';
import { NavigationBlocker } from '../../../app/navigation-blocker';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import RouterLinkButton from '../../../components/router-link-button';
import { SectionHeader } from '../../../components/section-header';
import { PARTNER_DIRECTORY_LEAD_MATCHING_ROUTE } from '../paths';
import { getAvailabilityUpdate } from './availability';
import ContactOptionsPreview from './contact-options-preview';
import {
	REQUIRED_LEAD_MATCHING_FIELDS,
	getAnsweredRequiredFieldCount,
	getLeadMatchingFormData,
	getLeadMatchingProfile,
	type LeadMatchingFormData,
} from './form-data';
import LeadMatchingSectionFields from './section-fields';
import { LEAD_MATCHING_SECTIONS, getLeadMatchingSectionTitle } from './sections';
import type { Agency, AgencyLeadMatchingProfile } from '@automattic/api-core';

// Answers are sets: the saved profile can list them in another order.
const toComparable = ( formData: LeadMatchingFormData ) =>
	JSON.stringify(
		Object.entries( formData )
			.sort( ( [ a ], [ b ] ) => a.localeCompare( b ) )
			.map( ( [ key, value ] ) => [ key, Array.isArray( value ) ? [ ...value ].sort() : value ] )
	);

/**
 * Every lead matching question on one page, with one Save that goes back to
 * the Lead matching tab.
 */
export default function AgencyPartnerDirectoryLeadMatchingPreferences() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { data: leadMatching } = useQuery( agencyLeadMatchingQuery( agency?.id ?? 0 ) );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 3 } /> }
					title={ __( 'Lead matching preferences' ) }
					description={ __(
						'Tell us about your agency and your ideal clients so we can match you with the best leads. All questions are required unless marked optional.'
					) }
				/>
			}
		>
			{ agency && leadMatching && (
				<LeadMatchingPreferencesForm
					agency={ agency }
					profile={ leadMatching.lead_matching_profile }
				/>
			) }
		</PageLayout>
	);
}

function LeadMatchingPreferencesForm( {
	agency,
	profile,
}: {
	agency: Agency;
	profile: AgencyLeadMatchingProfile | null;
} ) {
	const agencyId = agency.id;
	const savedAvailability = agency.profile?.listing_details?.is_available ?? true;
	const savedFormData = useMemo( () => getLeadMatchingFormData( profile ), [ profile ] );

	const { recordTracksEvent } = useAnalytics();
	const navigate = useNavigate();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const [ formData, setFormData ] = useState< LeadMatchingFormData >( savedFormData );
	const [ isAvailable, setIsAvailable ] = useState( savedAvailability );

	const { mutateAsync: saveAvailability, isPending: isSavingAvailability } = useMutation(
		agencyProfileMutation( agencyId )
	);
	const { mutateAsync: savePreferences, isPending: isSavingPreferences } = useMutation(
		agencyLeadMatchingMutation( agencyId )
	);
	const isSubmitting = isSavingAvailability || isSavingPreferences;

	const onFieldsChange = ( fields: Partial< LeadMatchingFormData > ) =>
		setFormData( ( state ) => ( { ...state, ...fields } ) );

	const onAvailabilityChange = ( checked: boolean ) => {
		setIsAvailable( checked );
		recordTracksEvent( 'calypso_a4a_partner_directory_lead_matching_availability_toggle', {
			agency_id: agencyId,
			is_available: checked,
		} );
	};

	const hasAvailabilityChange = isAvailable !== savedAvailability;
	const hasAnswerChanges = toComparable( formData ) !== toComparable( savedFormData );

	// Leaving after a save skips the unsaved-changes prompt: the saved data
	// can reach the form after this navigation starts.
	const backToLeadMatching = () =>
		navigate( { to: PARTNER_DIRECTORY_LEAD_MATCHING_ROUTE, ignoreBlocker: true } );

	const onSubmit = async () => {
		recordTracksEvent( 'calypso_a4a_partner_directory_lead_matching_submit', {
			agency_id: agencyId,
			completed_fields: getAnsweredRequiredFieldCount( formData ),
			total_fields: REQUIRED_LEAD_MATCHING_FIELDS.length,
		} );

		const trackResult = ( outcome: 'success' | 'error' ) =>
			recordTracksEvent(
				outcome === 'success'
					? 'calypso_a4a_partner_directory_lead_matching_submit_success'
					: 'calypso_a4a_partner_directory_lead_matching_submit_error',
				{ agency_id: agencyId, source: 'manual' }
			);

		if ( ! hasAvailabilityChange && ! hasAnswerChanges ) {
			backToLeadMatching();
			return;
		}

		// The availability lives on the public profile, so it saves there
		// first; the preferences are only sent when an answer changed.
		if ( hasAvailabilityChange ) {
			const update = getAvailabilityUpdate( agency.profile, isAvailable );
			try {
				if ( ! update ) {
					throw new Error( 'The agency has no public profile.' );
				}
				await saveAvailability( update );
			} catch {
				trackResult( 'error' );
				createErrorNotice( __( 'Failed to save availability.' ), {
					type: 'snackbar',
				} );
				return;
			}
		}

		if ( hasAnswerChanges ) {
			try {
				await savePreferences( getLeadMatchingProfile( formData, profile, isAvailable ) );
			} catch {
				trackResult( 'error' );
				createErrorNotice( __( 'Failed to save lead matching preferences.' ), {
					type: 'snackbar',
				} );
				return;
			}
		}

		trackResult( 'success' );
		createSuccessNotice( __( 'Lead matching preferences saved.' ), {
			type: 'snackbar',
		} );
		backToLeadMatching();
	};

	return (
		<VStack spacing={ 6 }>
			<NavigationBlocker
				shouldBlock={ ( hasAvailabilityChange || hasAnswerChanges ) && ! isSubmitting }
			/>
			{ LEAD_MATCHING_SECTIONS.map( ( section ) => (
				<Fragment key={ section }>
					<Card>
						<CardBody>
							<VStack spacing={ 4 }>
								<SectionHeader level={ 3 } title={ getLeadMatchingSectionTitle( section ) } />
								{ section === 'availability' ? (
									<ToggleControl
										__nextHasNoMarginBottom
										label={ __( 'Accepting new clients' ) }
										help={ __( 'Agencies not accepting new clients are not eligible for leads.' ) }
										checked={ isAvailable }
										onChange={ onAvailabilityChange }
									/>
								) : (
									<LeadMatchingSectionFields
										section={ section }
										formData={ formData }
										onChange={ onFieldsChange }
									/>
								) }
							</VStack>
						</CardBody>
					</Card>
					{ section === 'availability' && <ContactOptionsPreview key={ agencyId } /> }
				</Fragment>
			) ) }

			<ButtonStack justify="flex-start">
				<Button
					__next40pxDefaultSize
					variant="primary"
					onClick={ onSubmit }
					isBusy={ isSubmitting }
					disabled={ isSubmitting }
				>
					{ __( 'Save preferences' ) }
				</Button>
				<RouterLinkButton
					__next40pxDefaultSize
					variant="tertiary"
					to={ PARTNER_DIRECTORY_LEAD_MATCHING_ROUTE }
					disabled={ isSubmitting }
				>
					{ __( 'Cancel' ) }
				</RouterLinkButton>
			</ButtonStack>
		</VStack>
	);
}
