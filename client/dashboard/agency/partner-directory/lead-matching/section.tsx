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
import { useRef, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import Breadcrumbs from '../../../app/breadcrumbs';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { getDetailsFormData } from '../details/use-details-form';
import { PARTNER_DIRECTORY_LEAD_MATCHING_ROUTE } from '../paths';
import {
	REQUIRED_LEAD_MATCHING_FIELDS,
	getAnsweredRequiredFieldCount,
	getLeadMatchingFormData,
	getLeadMatchingProfile,
	type LeadMatchingFormData,
} from './form-data';
import LeadMatchingSectionFields from './section-fields';
import {
	getLeadMatchingSectionTitle,
	validateLeadMatchingSection,
	type LeadMatchingSection,
	type LeadMatchingValidationErrors,
} from './sections';
import type {
	Agency,
	AgencyLeadMatchingProfile,
	AgencyProfile,
	AgencyProfileUpdate,
} from '@automattic/api-core';

/**
 * The full public profile update with only the availability changed: the
 * profile endpoint replaces every field it is sent.
 */
function getAvailabilityUpdate(
	profile: AgencyProfile | null | undefined,
	isAvailable: boolean
): AgencyProfileUpdate | null {
	const details = getDetailsFormData( profile );
	if ( ! details ) {
		return null;
	}

	return {
		profile_company_name: details.name,
		profile_company_email: details.email,
		profile_company_website: details.website,
		profile_company_bio_description: details.bioDescription,
		profile_company_logo_url: details.logoUrl,
		profile_company_landing_page_url: details.landingPageUrl,
		profile_company_country: details.country,
		profile_listing_is_global: details.isGlobal,
		profile_listing_is_available: isAvailable,
		profile_listing_industries: details.industries,
		profile_listing_languages_spoken: details.languagesSpoken,
		profile_listing_services: details.services,
		profile_listing_products: details.products,
		profile_budget_budget_lower_range: details.budgetLowerRange,
	};
}

export default function AgencyPartnerDirectoryLeadMatchingSection( {
	section,
}: {
	section: LeadMatchingSection;
} ) {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { data: leadMatching } = useQuery( agencyLeadMatchingQuery( agency?.id ?? 0 ) );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 3 } /> }
					title={ getLeadMatchingSectionTitle( section ) }
				/>
			}
		>
			{ agency && leadMatching && (
				<LeadMatchingSectionForm
					section={ section }
					agency={ agency }
					profile={ leadMatching.lead_matching_profile }
				/>
			) }
		</PageLayout>
	);
}

function LeadMatchingSectionForm( {
	section,
	agency,
	profile,
}: {
	section: LeadMatchingSection;
	agency: Agency;
	profile: AgencyLeadMatchingProfile | null;
} ) {
	const agencyId = agency.id;
	const savedAvailability = agency.profile?.listing_details?.is_available ?? true;

	const { recordTracksEvent } = useAnalytics();
	const navigate = useNavigate();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const [ formData, setFormData ] = useState< LeadMatchingFormData >( () =>
		getLeadMatchingFormData( profile )
	);
	const [ isAvailable, setIsAvailable ] = useState( savedAvailability );
	const [ errors, setErrors ] = useState< LeadMatchingValidationErrors >( {} );
	const contentRef = useRef< HTMLDivElement >( null );

	const { mutateAsync: saveAvailability, isPending: isSavingAvailability } = useMutation(
		agencyProfileMutation( agencyId )
	);
	const { mutateAsync: savePreferences, isPending: isSavingPreferences } = useMutation(
		agencyLeadMatchingMutation( agencyId )
	);
	const isSubmitting = isSavingAvailability || isSavingPreferences;

	const onFieldsChange = ( fields: Partial< LeadMatchingFormData > ) => {
		setFormData( ( state ) => ( { ...state, ...fields } ) );
		setErrors( ( state ) => {
			const next = { ...state };
			for ( const field of Object.keys( fields ) ) {
				delete next[ field as keyof LeadMatchingValidationErrors ];
			}
			return next;
		} );
	};

	const onAvailabilityChange = ( checked: boolean ) => {
		setIsAvailable( checked );
		recordTracksEvent( 'calypso_a4a_partner_directory_lead_matching_availability_toggle', {
			agency_id: agencyId,
			is_available: checked,
		} );
	};

	const onSubmit = async () => {
		recordTracksEvent( 'calypso_a4a_partner_directory_lead_matching_submit', {
			agency_id: agencyId,
			completed_fields: getAnsweredRequiredFieldCount( formData ),
			total_fields: REQUIRED_LEAD_MATCHING_FIELDS.length,
			section,
		} );

		const validationErrors = validateLeadMatchingSection( section, formData );
		if ( Object.keys( validationErrors ).length > 0 ) {
			setErrors( validationErrors );
			const [ firstField ] = Object.keys( validationErrors );
			requestAnimationFrame( () => {
				contentRef.current
					?.querySelector( `[data-field-name="${ firstField }"]` )
					?.scrollIntoView( { behavior: 'smooth', block: 'nearest' } );
			} );
			return;
		}

		const trackResult = ( outcome: 'success' | 'error' ) =>
			recordTracksEvent( `calypso_a4a_partner_directory_lead_matching_submit_${ outcome }`, {
				agency_id: agencyId,
				source: 'manual',
				section,
			} );

		// The availability lives on the public profile, so its section saves
		// there only; the other sections send it along unchanged.
		if ( section === 'availability' ) {
			if ( isAvailable === savedAvailability ) {
				navigate( { to: PARTNER_DIRECTORY_LEAD_MATCHING_ROUTE } );
				return;
			}

			const update = getAvailabilityUpdate( agency.profile, isAvailable );
			try {
				if ( ! update ) {
					throw new Error( 'The agency has no public profile.' );
				}
				await saveAvailability( update );
			} catch {
				trackResult( 'error' );
				createErrorNotice( __( 'Something went wrong saving your availability.' ), {
					type: 'snackbar',
				} );
				return;
			}
		} else {
			try {
				await savePreferences( getLeadMatchingProfile( formData, profile, savedAvailability ) );
			} catch {
				trackResult( 'error' );
				createErrorNotice( __( 'Something went wrong saving your preferences.' ), {
					type: 'snackbar',
				} );
				return;
			}
		}

		trackResult( 'success' );
		createSuccessNotice( __( 'Your lead matching preferences were saved!' ), {
			type: 'snackbar',
		} );
		navigate( { to: PARTNER_DIRECTORY_LEAD_MATCHING_ROUTE } );
	};

	return (
		<VStack ref={ contentRef } spacing={ 8 }>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
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
								errors={ errors }
								onChange={ onFieldsChange }
							/>
						) }
					</VStack>
				</CardBody>
			</Card>

			<ButtonStack justify="flex-start">
				<Button
					variant="primary"
					onClick={ onSubmit }
					isBusy={ isSubmitting }
					disabled={ isSubmitting }
				>
					{ __( 'Save' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}
