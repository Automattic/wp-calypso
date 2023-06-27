import { FormInputValidation } from '@automattic/components';
import { Button } from '@wordpress/components';
import { trash, update } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
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
};

export function DomainCodePair( {
	id,
	domain,
	auth,
	onChange,
	onRemove,
	showLabels,
	hasDuplicates,
}: Props ) {
	const { __ } = useI18n();

	const validation = useValidationMessage( domain, auth, hasDuplicates );

	const { valid, loading, message, refetch } = validation;

	useEffect( () => {
		onChange( id, { domain, auth, valid } );
	}, [ domain, id, onChange, auth, valid, loading ] );

	const shouldReportError = hasDuplicates || ( ! loading && domain && auth );

	return (
		<div className="domains__domain-info-and-validation">
			<div className="domains__domain-info">
				<div className="domains__domain-domain">
					<FormFieldset>
						{ showLabels && <FormLabel htmlFor={ id }>{ __( 'Domain name' ) }</FormLabel> }
						<FormInput
							disabled={ valid }
							id={ id }
							value={ domain }
							onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
								onChange( id, { domain: event.target.value.trim(), auth, valid } )
							}
							placeholder={ __( 'example.com' ) }
						/>
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
							placeholder={ __( 'Authentication code' ) }
						/>
					</FormFieldset>
				</div>
				<div className="domains__domain-delete">
					<FormFieldset>
						{ showLabels && <FormLabel htmlFor={ id }>{ __( 'Refresh' ) }</FormLabel> }
						<Button disabled={ ! refetch } icon={ update } onClick={ () => refetch?.() } />
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
