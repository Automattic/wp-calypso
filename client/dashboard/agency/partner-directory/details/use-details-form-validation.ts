import { __ } from '@wordpress/i18n';
import emailValidator from 'email-validator';
import { useCallback, useState } from 'react';
import { isValidUrl } from '../lib';
import type { DetailsFormData } from './use-details-form';

export interface DetailsValidationState {
	name?: string;
	email?: string;
	website?: string;
	landingPage?: string;
	bio?: string;
	country?: string;
	industries?: string;
	services?: string;
	products?: string;
	languages?: string;
	minimumBudget?: string;
}

export default function useDetailsFormValidation() {
	const [ validationError, setValidationError ] = useState< DetailsValidationState >( {} );

	const updateValidationError = useCallback(
		( newState: DetailsValidationState ) =>
			setValidationError( ( previous ) => ( { ...previous, ...newState } ) ),
		[]
	);

	const validate = useCallback( ( payload: DetailsFormData ) => {
		const newValidationError: DetailsValidationState = {};

		if ( payload.name === '' ) {
			newValidationError.name = __( 'Company name can’t be empty' );
		}

		if ( payload.email === '' ) {
			newValidationError.email = __( 'Email can’t be empty' );
		} else if ( ! emailValidator.validate( payload.email ) ) {
			newValidationError.email = __( 'Please provide correct email address' );
		}

		if ( payload.website === '' ) {
			newValidationError.website = __( 'Website can’t be empty' );
		} else if ( ! isValidUrl( payload.website ) ) {
			newValidationError.website = __( 'Please enter a valid URL' );
		}

		if ( payload.landingPageUrl !== '' && ! isValidUrl( payload.landingPageUrl ) ) {
			newValidationError.landingPage = __( 'Please enter a valid URL' );
		}

		if ( payload.bioDescription === '' ) {
			newValidationError.bio = __( 'Bio description can’t be empty' );
		}

		if ( payload.country === '' || payload.country === null ) {
			newValidationError.country = __( 'Company location can’t be empty' );
		}

		if ( payload.industries.length < 1 ) {
			newValidationError.industries = __( 'Please provide industries' );
		}

		if ( payload.services.length < 1 ) {
			newValidationError.services = __( 'Please provide services offered' );
		}

		if ( payload.products.length < 1 ) {
			newValidationError.products = __( 'Please provide products you work with' );
		}

		if ( payload.languagesSpoken.length < 1 ) {
			newValidationError.languages = __( 'Please provide languages you speak' );
		}

		if ( payload.budgetLowerRange === '' ) {
			newValidationError.minimumBudget = __( 'Please provide your minimum budget' );
		}

		if ( Object.keys( newValidationError ).length > 0 ) {
			setValidationError( newValidationError );
			return newValidationError;
		}

		return null;
	}, [] );

	return { validate, validationError, updateValidationError };
}
