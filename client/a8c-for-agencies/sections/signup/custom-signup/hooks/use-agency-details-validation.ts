/**
 * PROTOTYPE — proof of concept only.
 *
 * Lightweight required-field checks for the `/custom-signup` detail steps. Each
 * step validates only the fields it shows. The duplicate-agency API check from
 * signup-v2 is skipped, since demo data is fake.
 */
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import type { PrototypeSignupData } from '../lib/prototype-signup-data';

export type DetailsField = keyof PrototypeSignupData;
export type AgencyDetailsErrors = Partial< Record< DetailsField, string > >;

export default function useAgencyDetailsValidation( fields: DetailsField[] ) {
	const translate = useTranslate();
	const [ errors, setErrors ] = useState< AgencyDetailsErrors >( {} );

	const validate = useCallback(
		( data: PrototypeSignupData ) => {
			const required = translate( 'This field is required.' );
			const checks: Partial< Record< DetailsField, () => string | undefined > > = {
				firstName: () => ( data.firstName.trim() ? undefined : required ),
				lastName: () => ( data.lastName.trim() ? undefined : required ),
				email: () =>
					/^\S+@\S+\.\S+$/.test( data.email.trim() )
						? undefined
						: translate( 'Enter a valid email address.' ),
				agencyName: () => ( data.agencyName.trim() ? undefined : required ),
				agencyUrl: () => ( data.agencyUrl.trim() ? undefined : required ),
				country: () => ( data.country ? undefined : required ),
			};

			const next: AgencyDetailsErrors = {};
			fields.forEach( ( field ) => {
				const error = checks[ field ]?.();
				if ( error ) {
					next[ field ] = error;
				}
			} );

			setErrors( next );
			return Object.keys( next ).length === 0;
		},
		[ fields, translate ]
	);

	const clearError = useCallback( ( field: DetailsField ) => {
		setErrors( ( prev ) => ( { ...prev, [ field ]: undefined } ) );
	}, [] );

	return { errors, validate, clearError };
}
