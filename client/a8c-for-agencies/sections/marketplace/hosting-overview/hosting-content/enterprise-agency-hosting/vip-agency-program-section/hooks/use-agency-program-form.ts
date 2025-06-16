import emailValidator from 'email-validator';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback, useMemo } from 'react';
import { useCountriesAndStates } from 'calypso/a8c-for-agencies/sections/signup/agency-details-form/hooks/use-countries-and-states';
import { CAPTURE_URL_RGX } from 'calypso/blocks/import/util';
export type AgencyProgramFormData = {
	businessEmail: string;
	firstName: string;
	lastName: string;
	jobTitle: string;
	phoneNumber: string;
	country: string;
	servicesProvided: string[];
	agencyWebsite?: string;
	agencySize?: string;
	agencyRevenue?: string;
	clientSites: string;
	subscribeToNewsletter: boolean;
};

export default function useAgencyProgramForm() {
	const { countryOptions } = useCountriesAndStates();
	const translate = useTranslate();

	const [ formData, setFormData ] = useState< AgencyProgramFormData >( {
		businessEmail: '',
		firstName: '',
		lastName: '',
		jobTitle: '',
		phoneNumber: '',
		country: '',
		servicesProvided: [],
		agencyWebsite: '',
		agencySize: '',
		agencyRevenue: '',
		clientSites: '',
		subscribeToNewsletter: false,
	} );

	const [ validationError, setValidationError ] = useState< Record< string, string > >( {} );

	const updateValidationError = useCallback(
		( newState: Record< string, string > ) => {
			setValidationError( ( prev ) => ( { ...prev, ...newState } ) );
		},
		[ setValidationError ]
	);

	const validate = useCallback(
		async ( payload: Partial< AgencyProgramFormData > ) => {
			const newValidationError: Record< string, string > = {};

			if ( payload.businessEmail?.trim() === '' ) {
				newValidationError.businessEmail = translate( 'Please enter your business email' );
			}

			if ( payload.businessEmail && ! emailValidator.validate( payload.businessEmail ) ) {
				newValidationError.businessEmail = translate( 'Please enter a valid business email' );
			}

			if ( payload.firstName?.trim() === '' ) {
				newValidationError.firstName = translate( 'Please enter your first name' );
			}

			if ( payload.lastName?.trim() === '' ) {
				newValidationError.lastName = translate( 'Please enter your last name' );
			}

			if ( payload.jobTitle?.trim() === '' ) {
				newValidationError.jobTitle = translate( 'Please enter your job title' );
			}

			if ( payload.phoneNumber?.trim() === '' ) {
				newValidationError.phoneNumber = translate( 'Please enter your phone number' );
			}

			if ( payload.country?.trim() === '' ) {
				newValidationError.country = translate( 'Please select your country' );
			}

			if (
				payload.agencyWebsite &&
				payload.agencyWebsite?.trim() !== '' &&
				! CAPTURE_URL_RGX.test( payload.agencyWebsite )
			) {
				newValidationError.agencyWebsite = translate( 'Please enter a valid URL' );
			}

			if ( payload.clientSites?.trim() === '' ) {
				newValidationError.clientSites = translate( 'Please provide a few links.' );
			}

			if ( ! payload.servicesProvided || payload.servicesProvided.length < 1 ) {
				newValidationError.servicesProvided = translate( 'Please select services you provide' );
			}

			if ( Object.keys( newValidationError ).length > 0 ) {
				setValidationError( newValidationError );
				return newValidationError;
			}

			return null;
		},
		[ translate ]
	);

	const updateFormData = useCallback(
		( name: string, value: string | string[] | boolean ) => {
			setFormData( ( prev ) => ( { ...prev, [ name ]: value } ) );
		},
		[ setFormData ]
	);

	const servicesProvidedOptions = useMemo(
		() => [
			{
				label: translate( 'Enterprise WordPress development' ),
				value: 'Enterprise WordPress development',
			},
			{
				label: translate( 'Content strategy and creation' ),
				value: 'Content strategy and creation',
			},
			{
				label: translate( 'Design and user experience' ),
				value: 'Design and user experience',
			},
			{
				label: translate( 'Performance optimization' ),
				value: 'Performance optimization',
			},
			{
				label: translate( 'Maintenance and support' ),
				value: 'Maintenance and support',
			},
		],
		[ translate ]
	);

	return {
		countryOptions,
		servicesProvidedOptions,
		formData,
		updateFormData,
		validationError,
		updateValidationError,
		validate,
	};
}
