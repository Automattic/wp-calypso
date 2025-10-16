import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { DataForm, Field, isItemValid } from '@wordpress/dataviews';
import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from '../../components/button-stack';
import { validateHostname } from '../../domains/name-servers/utils';
import RedirectInputField from './redirect-input-field';

export interface SiteRedirectFormData {
	redirect: string;
}

interface SiteRedirectFormProps {
	initialValue?: string;
	onSubmit: ( formData: SiteRedirectFormData ) => void;
	isSubmitting?: boolean;
	submitButtonText?: string;
	children?: React.ReactNode;
	disableWhenUnchanged?: boolean;
	onFormDataChange?: ( formData: SiteRedirectFormData ) => void;
}

export default function SiteRedirectForm( {
	initialValue = '',
	onSubmit,
	isSubmitting = false,
	submitButtonText = __( 'Save' ),
	children,
	disableWhenUnchanged = false,
	onFormDataChange,
}: SiteRedirectFormProps ) {
	const [ formData, setFormData ] = useState< SiteRedirectFormData >( {
		redirect: initialValue,
	} );

	const fields: Field< SiteRedirectFormData >[] = useMemo(
		() => [
			{
				id: 'redirect',
				type: 'text',
				Edit: ( { field, data, onChange } ) => {
					const { id, getValue } = field;
					return (
						<RedirectInputField
							value={ getValue( { item: data } ) }
							onChange={ ( value ) => onChange( { [ id ]: value } ) }
						/>
					);
				},
				isValid: {
					required: true,
					custom: ( formData: SiteRedirectFormData ) => {
						const value = formData.redirect;
						return validateHostname( value ) ? null : __( 'Please enter a valid hostname' );
					},
				},
			},
		],
		[]
	);

	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'redirect' ],
	};

	const isFormValid = isItemValid( formData, fields, form );
	const isUnchanged = disableWhenUnchanged && formData.redirect === initialValue;
	const isDisabled = isSubmitting || ! isFormValid || isUnchanged;

	const handleSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		onSubmit( formData );
	};

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 4 }>
				<DataForm< SiteRedirectFormData >
					data={ formData }
					fields={ fields }
					form={ form }
					onChange={ ( edits: Partial< SiteRedirectFormData > ) => {
						const newData = { ...formData, ...edits };
						setFormData( newData );
						onFormDataChange?.( newData );
					} }
				/>
				<ButtonStack justify="flex-start">
					<Button
						variant="primary"
						type="submit"
						__next40pxDefaultSize
						isBusy={ isSubmitting }
						disabled={ isDisabled }
					>
						{ submitButtonText }
					</Button>
				</ButtonStack>
				{ children }
			</VStack>
		</form>
	);
}
