import {
	agencyPressablePremiumPlanReferralMutation,
	agencyVipPartnerOpportunityMutation,
} from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { DataForm, useFormValidity } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import emailValidator from 'email-validator';
import { useMemo, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { getHostingReferralPayload, getVipPartnerOpportunityPayload } from './payload';
import { STATE_SUPPORTED_COUNTRIES, useCountryOptions } from './use-country-options';
import type { ReferralConfig } from './config';
import type { ReferHostingFormData } from './types';
import type { Field, Form } from '@wordpress/dataviews';

// Same rule as the classic form (`calypso/blocks/import/util`), copied so
// the dashboard has no dependency on the classic client.
const WEBSITE_REGEX =
	/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.][a-z0-9]+)*\.[a-z]{2,63}(:[0-9]{1,5})?(\/.*)?$/i;

const EMPTY_FORM_DATA: ReferHostingFormData = {
	companyName: '',
	address: '',
	country: '',
	state: '',
	city: '',
	zip: '',
	firstName: '',
	lastName: '',
	title: '',
	phone: '',
	email: '',
	website: '',
	opportunityDescription: '',
	leadType: '',
	isRfp: 'no',
};

// The classic form marks nothing as required and says so in the description,
// so the rules carry their own messages instead of the browser's generic ones.
// The comboboxes also opt out of the built-in elements rule, which would
// otherwise reject their empty placeholder value with a generic message.
const required =
	( key: keyof ReferHostingFormData, message: string ) => ( item: ReferHostingFormData ) =>
		item[ key ].trim() === '' ? message : null;

const getSnackbarMessages = () => ( {
	success: __( 'Your request has been submitted successfully.' ),
	error: __( 'An error occurred while submitting your request.' ),
} );

export default function ReferHostingForm( {
	agencyId,
	config,
	onSubmitted,
}: {
	agencyId: number;
	config: ReferralConfig;
	onSubmitted: () => void;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const isNarrow = useViewportMatch( 'small', '<' );
	const { countryOptions, statesByCountry } = useCountryOptions();
	const [ formData, setFormData ] = useState( EMPTY_FORM_DATA );

	const vipReferral = useMutation(
		withSnackbar( agencyVipPartnerOpportunityMutation( agencyId ), getSnackbarMessages() )
	);
	const premiumReferral = useMutation(
		withSnackbar( agencyPressablePremiumPlanReferralMutation( agencyId ), getSnackbarMessages() )
	);
	const isPending = vipReferral.isPending || premiumReferral.isPending;

	const stateOptions = statesByCountry[ formData.country ];

	const fields: Field< ReferHostingFormData >[] = useMemo(
		() => [
			{
				id: 'companyName',
				label: __( 'Company name' ),
				type: 'text',
				isValid: { custom: required( 'companyName', __( 'Please enter your company name' ) ) },
			},
			{
				id: 'address',
				label: __( 'Company address' ),
				type: 'text',
				isValid: { custom: required( 'address', __( 'Please enter your company address' ) ) },
			},
			{
				id: 'country',
				label: __( 'Country' ),
				type: 'text',
				Edit: 'combobox',
				placeholder: __( 'Select country' ),
				elements: countryOptions,
				isValid: {
					elements: false,
					custom: required( 'country', __( 'Please enter your country code' ) ),
				},
			},
			{
				id: 'state',
				label: __( 'State' ),
				type: 'text',
				Edit: 'combobox',
				placeholder: __( 'Select state' ),
				elements: stateOptions ?? [],
				isValid: { elements: false },
				isVisible: ( item ) => STATE_SUPPORTED_COUNTRIES.includes( item.country ),
			},
			{
				id: 'city',
				label: __( 'City' ),
				type: 'text',
				isValid: { custom: required( 'city', __( 'Please enter your city' ) ) },
			},
			{
				id: 'zip',
				label: __( 'ZIP/Postal code' ),
				type: 'text',
				isValid: { custom: required( 'zip', __( 'Please enter your ZIP/Postal code' ) ) },
			},
			{
				id: 'firstName',
				label: __( 'First name' ),
				type: 'text',
				isValid: { custom: required( 'firstName', __( 'Please enter your first name' ) ) },
			},
			{
				id: 'lastName',
				label: __( 'Last name' ),
				type: 'text',
				isValid: { custom: required( 'lastName', __( 'Please enter your last name' ) ) },
			},
			{
				id: 'title',
				label: __( 'Title' ),
				type: 'text',
				isValid: { custom: required( 'title', __( 'Please enter your title' ) ) },
			},
			{
				id: 'phone',
				label: __( 'Phone (optional)' ),
				type: 'text',
			},
			{
				id: 'email',
				label: __( 'Email' ),
				type: 'text',
				isValid: {
					custom: ( item ) => {
						if ( item.email.trim() === '' ) {
							return __( 'Please enter your email' );
						}
						if ( ! emailValidator.validate( item.email ) ) {
							return __( 'Please enter a valid email' );
						}
						return null;
					},
				},
			},
			{
				id: 'website',
				label: __( 'Website' ),
				type: 'text',
				isValid: {
					custom: ( item ) => {
						if ( item.website.trim() === '' ) {
							return __( 'Please enter your website' );
						}
						if ( ! WEBSITE_REGEX.test( item.website ) ) {
							return __( 'Please enter a valid URL' );
						}
						return null;
					},
				},
			},
			{
				id: 'opportunityDescription',
				label: __( 'Tell us more about this opportunity' ),
				type: 'text',
				Edit: 'textarea',
				isValid: {
					custom: required(
						'opportunityDescription',
						__( 'Please tell us about the opportunity' )
					),
				},
			},
			{
				id: 'leadType',
				label: __( 'Type of lead' ),
				type: 'text',
				Edit: 'combobox',
				placeholder: __( 'Select lead type' ),
				elements: [
					{ value: 'Media', label: __( 'Media' ) },
					{ value: 'Public Sector', label: __( 'Public sector' ) },
					{ value: 'Other', label: __( 'Other' ) },
				],
				isValid: {
					elements: false,
					custom: required( 'leadType', __( 'Please select a lead type' ) ),
				},
			},
			{
				id: 'isRfp',
				label: __( 'Is this an RFP?' ),
				type: 'text',
				Edit: 'radio',
				elements: [
					{ value: 'yes', label: __( 'Yes' ) },
					{ value: 'no', label: __( 'No' ) },
				],
			},
		],
		[ countryOptions, stateOptions ]
	);

	const companyForm: Form = {
		layout: { type: 'regular' },
		fields: [ 'companyName', 'address', 'country', 'state', 'city', 'zip' ],
	};
	const contactForm: Form = {
		layout: { type: 'regular' },
		fields: [
			{
				id: 'name',
				layout: isNarrow ? undefined : { type: 'row', alignment: 'start' },
				children: [ 'firstName', 'lastName' ],
			},
			'title',
			'phone',
			'email',
			'website',
		],
	};
	const opportunityForm: Form = {
		layout: { type: 'regular' },
		fields: [
			'opportunityDescription',
			...( config.hasEnterpriseFields ? [ 'leadType', 'isRfp' ] : [] ),
		],
	};
	const { validity, isValid } = useFormValidity( formData, fields, {
		layout: { type: 'regular' },
		fields: [
			...( companyForm.fields ?? [] ),
			...( contactForm.fields ?? [] ),
			...( opportunityForm.fields ?? [] ),
		],
	} );

	const handleChange = ( edits: Partial< ReferHostingFormData > ) => {
		setFormData( ( data ) => ( {
			...data,
			...edits,
			// A state belongs to the country it was picked under.
			...( edits.country !== undefined && edits.country !== data.country ? { state: '' } : {} ),
		} ) );
	};

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
		if ( ! isValid || isPending ) {
			return;
		}

		recordTracksEvent( config.events.formSubmit );
		if ( config.hasEnterpriseFields ) {
			vipReferral.mutate( getVipPartnerOpportunityPayload( formData ), { onSuccess: onSubmitted } );
		} else {
			premiumReferral.mutate( getHostingReferralPayload( formData ), { onSuccess: onSubmitted } );
		}
	};

	const sections = [
		{ id: 'company', title: __( 'Your client’s company information' ), form: companyForm },
		{ id: 'contact', title: __( 'Your client’s contact information' ), form: contactForm },
		{ id: 'opportunity', title: __( 'Opportunity information' ), form: opportunityForm },
	];

	return (
		<form onSubmit={ handleSubmit } autoComplete="off">
			<VStack spacing={ 8 }>
				{ sections.map( ( section ) => (
					<Card key={ section.id }>
						<CardBody>
							<VStack spacing={ 4 }>
								<SectionHeader level={ 3 } title={ section.title } />
								<DataForm< ReferHostingFormData >
									data={ formData }
									fields={ fields }
									form={ section.form }
									validity={ validity }
									onChange={ handleChange }
								/>
							</VStack>
						</CardBody>
					</Card>
				) ) }
				<ButtonStack justify="flex-start">
					<Button
						type="submit"
						variant="primary"
						__next40pxDefaultSize
						isBusy={ isPending }
						disabled={ isPending }
					>
						{ config.ctaText }
					</Button>
				</ButtonStack>
			</VStack>
		</form>
	);
}
