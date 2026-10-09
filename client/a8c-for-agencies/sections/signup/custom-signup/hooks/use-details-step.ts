/**
 * PROTOTYPE — proof of concept only.
 *
 * Shared state for the `/custom-signup` detail steps ("About you" and "About
 * your agency"): local form data, per-step validation, and autofill blocking.
 */
import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import useAgencyDetailsValidation, { DetailsField } from './use-agency-details-validation';
import useDisableAutofill from './use-disable-autofill';
import type { PrototypeSignupData } from '../lib/prototype-signup-data';

export default function useDetailsStep(
	initialData: PrototypeSignupData,
	requiredFields: DetailsField[],
	onContinue: ( data: PrototypeSignupData ) => void
) {
	const [ data, setData ] = useState< PrototypeSignupData >( initialData );
	const { errors, validate, clearError } = useAgencyDetailsValidation( requiredFields );
	const formRef = useRef< HTMLDivElement >( null );
	useDisableAutofill( formRef );

	const update = < K extends DetailsField >( field: K, value: PrototypeSignupData[ K ] ) => {
		setData( ( prev ) => ( { ...prev, [ field ]: value } ) );
		clearError( field );
	};

	const onFieldChange =
		( field: DetailsField ) => ( e: ChangeEvent< HTMLInputElement | HTMLSelectElement > ) =>
			update( field, e.target.value as never );

	const handleSubmit = ( e: FormEvent ) => {
		e.preventDefault();
		if ( validate( data ) ) {
			onContinue( data );
		}
	};

	return { data, errors, update, onFieldChange, handleSubmit, formRef };
}
