import { useQueryClient } from '@tanstack/react-query';
import { translate, useTranslate } from 'i18n-calypso';
import { useState, useMemo } from 'react';
import useRequestContactVerificationCode from 'calypso/state/jetpack-agency-dashboard/hooks/use-request-contact-verification-code';
import useResendVerificationCodeMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-resend-contact-verification-code';
import useValidateVerificationCodeMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-validate-contact-verification-code';
import {
	RequestVerificationCodeParams,
	ValidateVerificationCodeParams,
	ResendVerificationCodeParams,
	AllowedMonitorContactActions,
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

			const newEmailItem = { email_address: params.value, verified: data.verified };
			const newSMSItem = {
				sms_number: params.value,
				country_code: params.country_code,
				country_numeric_code: params.country_numeric_code,
				verified: data.verified,
			};

			if ( ! oldContacts ) {
				// If there are no contacts, create a new object
				return {
					...( type === 'email' && { emails: [ newEmailItem ] } ),
					...( type === 'sms' && { sms_numbers: [ newSMSItem ] } ),
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
						newEmailItem,
					],
				} ),
				...( type === 'sms' && {
					// Replace if it exists, otherwise add it
					sms_numbers: [
						...oldContacts.sms_numbers.filter(
							( sms: { sms_number: string; country_numeric_code: string } ) =>
								`${ sms.country_numeric_code }${ sms.sms_number }` !==
								`${ params.country_numeric_code }${ params.value }` // Add the country code to the number
						),
						newSMSItem,
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

export function useContactModalTitleAndSubtitle(
	type: 'email' | 'phone',
	action: AllowedMonitorContactActions
): {
	title: string;
	subtitle: string;
} {
	const translate = useTranslate();

	const getContactModalTitleAndSubTitle = useMemo(
		() => ( {
			email: {
				add: {
					title: translate( 'Add new email address' ),
					subtitle: translate(
						'Please use an email address that is accessible. Only alerts will be sent.'
					),
				},
				edit: {
					title: translate( 'Edit your email address' ),
					subtitle: translate( 'If you update your email address, you’ll need to verify it.' ),
				},
				remove: {
					title: translate( 'Remove Email' ),
					subtitle: translate( 'Are you sure you want to remove this email address?' ),
				},
				verify: {
					title: translate( 'Verify your email address' ),
					subtitle: translate( 'We’ll send a code to verify your email address.' ),
				},
			},
			phone: {
				add: {
					title: translate( 'Add your phone number' ),
					subtitle: translate(
						'Please use phone number that is accessible. Only alerts will be sent.'
					),
				},
				edit: {
					title: translate( 'Edit your phone number' ),
					subtitle: translate( 'If you update your number, you’ll need to verify it.' ),
				},
				remove: {
					title: '',
					subtitle: '',
				},
				verify: {
					title: translate( 'Verify your phone number' ),
					subtitle: translate( 'We’ll send a code to verify your phone number.' ),
				},
			},
		} ),
		[ translate ]
	);

	return getContactModalTitleAndSubTitle[ type ][ action ];
}
