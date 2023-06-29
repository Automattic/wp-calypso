import { useIsDomainCodeValid } from '@automattic/data-stores';
import { doesStringResembleDomain } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { getAvailabilityNotice } from 'calypso/lib/domains/registration/availability-messages';

export function useValidationMessage( domain: string, auth: string, hasDuplicates: boolean ) {
	// record passed domains to avoid revalidation
	const [ passed, setPassed ] = useState( false );
	const { __ } = useI18n();

	const [ domainDebounced ] = useDebounce( domain, 500 );
	const [ authDebounced ] = useDebounce( auth, 500 );

	const hasGoodDomain = doesStringResembleDomain( domainDebounced );
	const hasGoodAuthCode = hasGoodDomain && auth.trim().length > 0;

	const passedLocalValidation = hasGoodDomain && hasGoodAuthCode && ! hasDuplicates;

	const {
		data: validationResult,
		isFetching: isValidating,
		refetch,
	} = useIsDomainCodeValid(
		{
			domain: domainDebounced,
			auth: authDebounced,
		},
		{
			enabled: Boolean( ! passed && passedLocalValidation ),
			retry: false,
		}
	);

	if ( hasDuplicates ) {
		return {
			valid: false,
			loading: false,
			message: __( 'This domain has already been entered.' ),
		};
	}

	const availabilityNotice = getAvailabilityNotice( domainDebounced, validationResult?.status );

	if ( passed ) {
		setPassed( true );

		return {
			valid: true,
			loading: false,
			message: __( 'This domain is unlocked and ready to be transferred.' ),
		};
	}

	if ( ! hasGoodDomain ) {
		return {
			valid: false,
			loading: false,
			message: __( 'Please enter a valid domain name.' ),
		};
	}

	if ( ! hasGoodAuthCode ) {
		return {
			valid: false,
			loading: false,
			message: __( 'Please enter a valid authentication code.' ),
		};
	}

	// local validation passed, but we're still loading
	if ( isValidating || ! validationResult ) {
		return {
			valid: false,
			loading: true,
			message: __( 'Checking domain lock status.' ),
		};
	}

	if ( availabilityNotice?.message ) {
		return {
			valid: false,
			loading: false,
			message: availabilityNotice?.message,
			refetch,
		};
	}

	if ( validationResult?.error ) {
		return {
			valid: false,
			loading: false,
			message: __(
				'An unknown error occurred while checking the domain transferability. Please try again or contact support'
			),
			refetch,
		};
	}

	// final success
	if ( validationResult.auth_code_valid ) {
		return {
			valid: true,
			loading: false,
			message: __( 'This domain is unlocked and ready to be transferred.' ),
		};
	}

	// partial success
	if ( validationResult?.unlocked ) {
		return {
			valid: false,
			loading: false,
			message: __( 'This domain is unlocked but the authentication code seems incorrect.' ),
			refetch,
		};
	} else if ( validationResult?.registered === false ) {
		return {
			valid: false,
			loading: false,
			message: __( 'This domain does not seem to be registered.' ),
		};
	} else if ( validationResult?.unlocked === false ) {
		return {
			valid: false,
			loading: false,
			message: __( 'This domain does not seem to be unlocked.' ),
			refetch,
		};
	}

	return {
		valid: false,
		loading: false,
		message: __(
			'An unknown error occurred while checking the domain transferability. Please try again or contact support'
		),
		refetch,
	};
}
