import { updateSiteRedirectMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Card, CardBody, __experimentalVStack as VStack, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field, isItemValid } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useMemo } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { validateHostname } from '../../domains/name-servers/utils';
import RedirectInputField from './redirect-input-field';

interface ManageSiteRedirectProps {
	siteId: number;
	currentRedirect: string;
}

interface SiteRedirectFormData {
	redirect: string;
}

export default function ManageSiteRedirect( { siteId, currentRedirect }: ManageSiteRedirectProps ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ formData, setFormData ] = useState< SiteRedirectFormData >( {
		redirect: currentRedirect,
	} );
	const { mutate: updateSiteRedirect, isPending } = useMutation(
		updateSiteRedirectMutation( siteId )
	);

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

	const form = { layout: { type: 'regular' as const }, fields: [ 'redirect' ] };

	const isFormValid = isItemValid( formData, fields, form );

	const handleSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		updateSiteRedirect( formData.redirect ?? '', {
			onSuccess: () => {
				createSuccessNotice( __( 'Site redirect updated successfully.' ), {
					type: 'snackbar',
				} );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to update site redirect.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<form onSubmit={ handleSubmit }>
						<VStack spacing={ 4 }>
							<DataForm< SiteRedirectFormData >
								data={ formData }
								fields={ fields }
								form={ form }
								onChange={ ( edits: Partial< SiteRedirectFormData > ) => {
									setFormData( ( data ) => ( { ...data, ...edits } ) );
								} }
							/>
							<ButtonStack justify="flex-start">
								<Button
									variant="primary"
									type="submit"
									isBusy={ isPending }
									disabled={ isPending || formData.redirect === currentRedirect || ! isFormValid }
								>
									{ __( 'Save' ) }
								</Button>
							</ButtonStack>
						</VStack>
					</form>
				</VStack>
			</CardBody>
		</Card>
	);
}
