import { FormInputValidation } from '@automattic/components';
import { Button, Icon } from '@wordpress/components';
import { check, trash, closeSmall } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { useEffect } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import { useValidationMessage } from './use-validation-message';

type Props = {
	id: string;
	domain: string;
	auth: string;
	onChange: ( id: string, value: { domain: string; auth: string; valid: boolean } ) => void;
	onRemove: ( id: string ) => void;
	showLabels: boolean;
	hasDuplicates: boolean;
	showDelete: boolean;
};

const domainInputFieldIcon = ( isValidDomain: boolean, shouldReportError: boolean ) => {
	return (
		shouldReportError && (
			<span className="domains__domain-input-icon-container">
				<Icon
					size={ 24 }
					icon={ isValidDomain ? check : closeSmall }
					className={ classnames( 'domains__domain-input-icon', {
						'is-valid': isValidDomain,
						'is-not-valid': ! isValidDomain,
					} ) }
				/>
			</span>
		)
	);
};

export function DomainCodePair( {
	id,
	domain,
	auth,
	onChange,
	onRemove,
	showLabels,
	hasDuplicates,
	showDelete,
}: Props ) {
	const { __ } = useI18n();

	const validation = useValidationMessage( domain, auth, hasDuplicates );

	const { valid, loading, message } = validation;

	useEffect( () => {
		onChange( id, { domain, auth, valid } );
	}, [ domain, id, onChange, auth, valid, loading ] );

	const shouldReportError = hasDuplicates || ( ! loading && domain && auth ? true : false );

	return (
		<div
			className={ classnames( 'domains__domain-info-and-validation', {
				'has-delete': showDelete,
			} ) }
		>
			<div className="domains__domain-info">
				<div className="domains__domain-domain">
					<FormFieldset>
						{ showLabels && <FormLabel htmlFor={ id }>{ __( 'Domain name' ) }</FormLabel> }
						<FormInput
							disabled={ valid }
							id={ id }
							value={ domain }
							onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
								onChange( id, { domain: event.target.value.trim().toLowerCase(), auth, valid } )
							}
						/>
						{ domainInputFieldIcon( valid, shouldReportError ) }
					</FormFieldset>
				</div>
				<div className="domains__domain-key">
					<FormFieldset>
						{ showLabels && (
							<FormLabel htmlFor={ id + '-auth' }>{ __( 'Authentication code' ) }</FormLabel>
						) }
						<FormInput
							id={ id + '-auth' }
							disabled={ valid || hasDuplicates }
							value={ auth }
							onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
								onChange( id, { domain, auth: event.target.value.trim(), valid } )
							}
						/>
						{ domainInputFieldIcon( valid, shouldReportError ) }
					</FormFieldset>
				</div>

				<div className="domains__domain-delete">
					<FormFieldset>
						{ showLabels && <FormLabel htmlFor={ id }>{ __( 'Delete' ) }</FormLabel> }
						<Button icon={ trash } onClick={ () => onRemove( id ) } />
					</FormFieldset>
				</div>
			</div>
			{ shouldReportError && (
				<FormInputValidation isError={ ! valid } text={ message }></FormInputValidation>
			) }
			{ message && loading && <FormExplanation>{ message }</FormExplanation> }
		</div>
	);
}
