import { DataForm, isItemValid } from '@automattic/dataviews';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { siteOwnerTransferEligibilityCheckMutation } from '../../app/queries';
import { SectionHeader } from '../../components/section-header';
import type { Field } from '@automattic/dataviews';

export type ConfirmNewOwnerFormData = {
	email: string;
};

const fields: Field< ConfirmNewOwnerFormData >[] = [
	{
		id: 'email',
		label: __( 'Email' ),
		type: 'email' as const,
	},
];

const form = {
	type: 'regular' as const,
	fields: [ 'email' ],
};

export function ConfirmNewOwnerForm( {
	siteSlug,
	newOwnerEmail,
	onSubmit,
}: {
	siteSlug: string;
	newOwnerEmail: string;
	onSubmit: ( data: ConfirmNewOwnerFormData ) => void;
} ) {
	const [ formData, setFormData ] = useState( {
		email: newOwnerEmail,
	} );

	const mutation = useMutation( siteOwnerTransferEligibilityCheckMutation( siteSlug ) );

	const isSaveDisabled = ! isItemValid( formData, fields, form );

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();

		mutation.mutate(
			{ new_site_owner: formData.email },
			{
				onSuccess: () => {
					onSubmit( formData );
				},
				onError: () => {
					// TODO: Display error message below the field.
				},
			}
		);
	};

	return (
		<>
			<VStack style={ { padding: '8px 0 12px' } }>
				<SectionHeader title={ __( 'Confirm new owner' ) } level={ 3 } />
				<Text lineHeight="20px">
					{ createInterpolateElement(
						__(
							"Ready to transfer <siteSlug /> and its associated purchases? Simply enter the new owner's email below, or choose an existing user to start the transfer process."
						),
						{
							siteSlug: <strong>{ siteSlug }</strong>,
						}
					) }
				</Text>
			</VStack>
			<form onSubmit={ handleSubmit }>
				<VStack spacing={ 4 }>
					{ /* TODO: Update the gap between each field */ }
					<DataForm< ConfirmNewOwnerFormData >
						data={ formData }
						fields={ fields }
						form={ form }
						onChange={ ( edits: Partial< ConfirmNewOwnerFormData > ) => {
							setFormData( ( data ) => ( { ...data, ...edits } ) );
						} }
					/>
					<HStack justify="flex-start">
						<Button
							variant="primary"
							type="submit"
							isBusy={ mutation.isPending }
							disabled={ isSaveDisabled }
						>
							{ __( 'Continue' ) }
						</Button>
					</HStack>
				</VStack>
			</form>
		</>
	);
}
