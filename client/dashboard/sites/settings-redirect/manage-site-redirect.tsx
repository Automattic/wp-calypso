import { updateSiteRedirectMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	Button,
	__experimentalInputControl as InputControl,
	__experimentalInputControlPrefixWrapper as InputControlPrefixWrapper,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field, NormalizedField } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useMemo } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { validateHostname } from '../../domains/name-servers/utils';

interface ManageSiteRedirectProps {
	siteId: number;
	currentRedirect: string;
}

interface SiteRedirectFormData {
	redirect: string;
}

export default function RedirectsSettings( { siteId, currentRedirect }: ManageSiteRedirectProps ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ formData, setFormData ] = useState< SiteRedirectFormData >( {
		redirect: currentRedirect,
	} );
	const { mutate: updateSiteRedirect, isPending } = useMutation(
		updateSiteRedirectMutation( siteId )
	);

	const withoutHttp = ( url: string ) => {
		return url.replace( /^https?:\/\//, '' );
	};

	const fields: Field< SiteRedirectFormData >[] = useMemo(
		() => [
			{
				id: 'redirect',
				label: 'Redirect',
				type: 'text',
				Edit: ( { field, data, onChange } ) => {
					const { id, getValue } = field;
					return (
						<InputControl
							prefix={ <InputControlPrefixWrapper>HTTP://</InputControlPrefixWrapper> }
							__next40pxDefaultSize
							value={ getValue( { item: data } ) }
							onChange={ ( value ) => {
								const processedValue = withoutHttp( value ?? '' );
								return onChange( { [ id ]: processedValue } );
							} }
						/>
					);
				},
				isValid: {
					required: true,
					custom: (
						formData: SiteRedirectFormData,
						field: NormalizedField< SiteRedirectFormData >
					) => {
						const value = formData.redirect;
						// Skip validation for empty optional fields
						if ( ! value && ! field.isValid?.required ) {
							return null;
						}
						return validateHostname( value ) ? null : __( 'Please enter a valid hostname' );
					},
				},
			},
		],
		[]
	);

	const form = { layout: { type: 'regular' as const }, fields: [ 'redirect' ] };

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
					<div>
						Manage site redirect { siteId } { currentRedirect }
					</div>
					<form onSubmit={ handleSubmit }>
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
								disabled={ isPending || formData.redirect === currentRedirect }
							>
								{ __( 'Save' ) }
							</Button>
						</ButtonStack>
					</form>
				</VStack>
			</CardBody>
		</Card>
	);
}
