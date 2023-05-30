import { useQueryClient } from '@tanstack/react-query';
import { translate } from 'i18n-calypso';
import useRequestContactVerificationCode from 'calypso/state/jetpack-agency-dashboard/hooks/use-request-contact-verification-code';
import useValidateVerificationCodeMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-validate-contact-verification-code';
import {
	RequestVerificationCodeParams,
	ValidateVerificationCodeParams,
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
} {
	const queryClient = useQueryClient();

	const data = useValidateVerificationCodeMutation( {
		retry: false,
		onSuccess: async ( data: { verified: boolean; email_address: string }, params ) => {
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
	return { ...data, errorMessage };
}
