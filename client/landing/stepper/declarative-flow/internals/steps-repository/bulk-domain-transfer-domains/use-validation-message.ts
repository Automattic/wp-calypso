import { useIsDomainsUnlocked, useIsDomainCodeValid } from '@automattic/data-stores';
import { doesStringResembleDomain } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';

export function useValidationMessage( domain: string, auth: string ) {
	// record pass domains to avoid revalidation
	const [ passed, setPassed ] = useState( false );
	const { __ } = useI18n();

	const [ domainDebounced ] = useDebounce( domain, 500 );
	const [ authDebounced ] = useDebounce( auth, 500 );

	const hasGoodDomain = doesStringResembleDomain( domainDebounced );
	const hasGoodAuthCode = hasGoodDomain && authDebounced.trim().length > 0;

	const passedLocalValidation = hasGoodDomain && hasGoodAuthCode;

	const { data: isDomainUnlocked, isInitialLoading: isLoadingLock } = useIsDomainsUnlocked(
		domainDebounced,
		{
			enabled: ! passed && passedLocalValidation,
		}
	);

	const { data: isDomainCodeValid, isInitialLoading: isLoadingCode } = useIsDomainCodeValid(
		{
			domain: domainDebounced,
			auth: authDebounced,
		},
		{
			enabled: ! passed && passedLocalValidation && isDomainUnlocked?.unlocked,
		}
	);

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
			message: __( 'Please enter a valid auth code.' ),
		};
	}

	// local validation passed, but we're still loading
	if ( isLoadingLock ) {
		return {
			valid: false,
			loading: true,
			message: __( 'Checking domain lock status.' ),
		};
	}

	if ( isLoadingCode ) {
		return {
			valid: false,
			loading: true,
			message: __( 'Checking domain authentication code.' ),
		};
	}

	// final success
	if ( isDomainCodeValid?.success ) {
		return {
			valid: true,
			loading: false,
			message: __( 'This domain is unlocked and ready to be transferred.' ),
		};
	}

	// partial success
	if ( isDomainUnlocked?.unlocked ) {
		return {
			valid: false,
			loading: false,
			message: __( 'This domain is unlocked but the authentication code seems incorrect.' ),
		};
	} else if ( isDomainUnlocked?.unlocked === null ) {
		return {
			valid: false,
			loading: false,
			message: __( 'This domain does not seem to be registered.' ),
		};
	} else if ( isDomainUnlocked?.unlocked === false ) {
		return {
			valid: false,
			loading: false,
			message: __( 'This domain does not seem to be unlocked.' ),
		};
	}

	return {
		valid: false,
		loading: false,
		message: __(
			'An unknown error occurred while checking the domain transferability. Please try again or contact support'
		),
	};
}
