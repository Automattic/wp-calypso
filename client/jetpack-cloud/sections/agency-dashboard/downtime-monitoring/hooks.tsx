import { useQueryClient } from '@tanstack/react-query';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import useRequestContactVerificationCode from 'calypso/state/jetpack-agency-dashboard/hooks/use-request-contact-verification-code';
import useResendVerificationCodeMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-resend-contact-verification-code';
import useValidateVerificationCodeMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-validate-contact-verification-code';
import {
	RequestVerificationCodeParams,
	ValidateVerificationCodeParams,
	ResendVerificationCodeParams,
} from '../sites-overview/types';

export function useRequestVerificationCode(): {
	mutate: ( params: RequestVerificationCodeParams ) => void;
	isError: boolean;
	isLoading: boolean;
	isSuccess: boolean;
} {
	return useRequestContactVerificationCode( {
		retry: false,
	} );
}

const verificationErrorMessages: { [ key: string ]: string } = {
	jetpack_agency_contact_invalid_verification_code: translate( 'Invalid Code' ),
	jetpack_agency_contact_expired_verification_code: translate( 'Code Expired' ),
};

export function useValidateVerificationCode(): {
	mutate: ( params: ValidateVerificationCodeParams ) => void;
	isLoading: boolean;
	isSuccess: boolean;
	isError: boolean;
	errorMessage?: string;
	isVerified: boolean;
} {
	const queryClient = useQueryClient();

	const [ isAlreadyVerifed, setIsAlreadyVerifed ] = useState( false );

	const handleSetMonitoringContacts = async (
		data: { verified: boolean },
		params: ValidateVerificationCodeParams
	) => {
		const queryKey = [ 'monitor_notification_contacts' ];

		// Cancel any current refetches, so they don't overwrite our optimistic update
		await queryClient.cancelQueries( queryKey );

		// Optimistically update the contacts
		queryClient.setQueryData( queryKey, ( oldContacts: any ) => {
			const type = params.type;
			if ( ! oldContacts ) {
				// If there are no contacts, create a new object
				return {
					emails: [ { email_address: params.value, verified: data.verified } ],
				};
			}
			return {
				...oldContacts,
				...( type === 'email' && {
					// Replace if it exists, otherwise add it
					emails: [
						...oldContacts.emails.filter(
							( email: { email_address: string } ) => email.email_address !== params.value
						),
						{ email_address: params.value, verified: data.verified },
					],
				} ),
			};
		} );
	};

	const data = useValidateVerificationCodeMutation( {
		retry: false,
		onSuccess: async ( data, params ) => {
			await handleSetMonitoringContacts( data, params );
		},
		onError: async ( error, params ) => {
			if ( error?.code === 'jetpack_agency_contact_is_verified' ) {
				// Add the contact to the list of contacts if already verified
				setIsAlreadyVerifed( true );
				await handleSetMonitoringContacts( { verified: true }, params );
			}
		},
	} );

	let errorMessage;
	if ( data.isError ) {
		errorMessage = translate( 'Something went wrong.' );
		const reasonCode = data?.error?.code;
		if ( reasonCode ) {
			errorMessage = verificationErrorMessages?.[ reasonCode ] || errorMessage;
		}
	}
	return { ...data, errorMessage, isVerified: data.isSuccess || isAlreadyVerifed };
}

export function useResendVerificationCode(): {
	mutate: ( params: ResendVerificationCodeParams ) => void;
	isLoading: boolean;
	isSuccess: boolean;
	isError: boolean;
} {
	return useResendVerificationCodeMutation( {
		retry: () => {
			return false;
		},
	} );
}
