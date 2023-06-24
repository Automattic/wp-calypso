import { FormInputValidation } from '@automattic/components';
import { useIsDomainsUnlocked, useIsDomainCodeValid } from '@automattic/data-stores';
import { doesStringResembleDomain } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { trash } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormInput from 'calypso/components/forms/form-text-input';

function useValidationMessage( domain: string, auth: string ) {
	const { __ } = useI18n();

	const [ domainDebounced ] = useDebounce( domain, 500 );
	const [ authDebounced ] = useDebounce( auth, 500 );

	const hasGoodDomain = doesStringResembleDomain( domainDebounced );
	const hasGoodAuthCode = hasGoodDomain && authDebounced.trim().length > 0;

	const passedLocalValidation = hasGoodDomain && hasGoodAuthCode;

	const { data: isDomainUnlocked, isInitialLoading: isLoadingLock } = useIsDomainsUnlocked(
		domainDebounced,
		{
			enabled: passedLocalValidation,
		}
	);

	const { data: isDomainCodeValid, isInitialLoading: isLoadingCode } = useIsDomainCodeValid(
		{
			domain: domainDebounced,
			auth: authDebounced,
		},
		{
			enabled: passedLocalValidation && isDomainUnlocked?.unlocked,
		}
	);

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

type Props = {
	id: string;
	domain: string;
	auth: string;
	onChange: ( id: string, value: { domain: string; auth: string; valid: boolean } ) => void;
	onRemove: ( id: string ) => void;
	showLabels: boolean;
};

export function DomainCodePair( { id, domain, auth, onChange, onRemove, showLabels }: Props ) {
	const { __ } = useI18n();

	const validation = useValidationMessage( domain, auth );

	const { valid, loading, message } = validation;

	useEffect( () => {
		onChange( id, { domain, auth, valid } );
	}, [ domain, id, onChange, auth, valid, loading ] );

	return (
		<div className="domains__domain-info-and-validation">
			<div className="domains__domain-info">
				<div className="domains__domain-domain">
					<FormFieldset>
						{ showLabels && <FormLabel htmlFor={ id }>{ __( 'Domain name' ) }</FormLabel> }
						<FormInput
							disabled={ valid }
							isError={ ! valid }
							id={ id }
							value={ domain }
							onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
								onChange( id, { domain: event.target.value, auth, valid } )
							}
							placeholder={ __( 'example.com' ) }
						/>
					</FormFieldset>
				</div>
				<div className="domains__domain-key">
					<FormFieldset>
						{ showLabels && <FormLabel htmlFor={ id + '-auth' }>{ __( 'Auth code' ) }</FormLabel> }
						<FormInput
							id={ id + '-auth' }
							disabled={ valid }
							value={ auth }
							onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
								onChange( id, { domain, auth: event.target.value, valid } )
							}
							placeholder={ __( 'Auth code' ) }
						/>
					</FormFieldset>
				</div>
				<div className="domains__domain-delete">
					<FormFieldset>
						{ showLabels && <FormLabel htmlFor={ id }>{ __( 'Delete' ) }</FormLabel> }
						<Button icon={ trash } onClick={ () => onRemove( id ) } />
					</FormFieldset>
				</div>
			</div>
			{ message && (
				<FormInputValidation isError={ ! valid } text={ message }></FormInputValidation>
			) }
		</div>
	);
}
