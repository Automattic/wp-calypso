import { doesStringResembleDomain } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { useDebounce } from 'use-debounce';
import { useIsDomainCodeValid } from 'calypso/landing/stepper/hooks/use-is-domain-code-valid';
import { getAvailabilityNotice } from 'calypso/lib/domains/registration/availability-messages';

export function useValidationMessage( domain: string, auth: string, hasDuplicates: boolean ) {
	const { __ } = useI18n();

	const [ domainDebounced ] = useDebounce( domain, 500 );
	const [ authDebounced ] = useDebounce( auth, 500 );

	const hasGoodDomain = doesStringResembleDomain( domainDebounced );
	const hasGoodAuthCode = hasGoodDomain && auth.trim().length > 0;

	const passedLocalValidation = hasGoodDomain && hasGoodAuthCode && ! hasDuplicates;

	const isDebouncing = domainDebounced !== domain || authDebounced !== auth;

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
			enabled: Boolean( passedLocalValidation ),
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
	if ( isValidating || isDebouncing ) {
		return {
			valid: false,
			loading: true,
			message: __( 'Checking domain lock status.' ),
		};
	}

	const availabilityNotice = getAvailabilityNotice( domain, validationResult?.status, null, true );

	// final success
	if ( validationResult?.auth_code_valid ) {
		return {
			valid: true,
			loading: false,
			message: __( 'This domain is unlocked and ready to be transferred.' ),
		};
	} else if ( availabilityNotice?.message ) {
		return {
			valid: false,
			loading: false,
			message: availabilityNotice?.message,
		};
	} else if ( validationResult?.auth_code_valid === false ) {
		// the auth check API has a bug and returns error 400 for incorrect auth codes,
		// in which case, the `useIsDomainCodeValid` hook returns `false`.
		return {
			valid: false,
			loading: false,
			message: __( 'This domain is unlocked but the authentication code seems incorrect.' ),
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
