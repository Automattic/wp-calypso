import { DataForm, isItemValid } from '@automattic/dataviews';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { useState } from 'react';
import { siteOwnerTransferEligibilityCheckMutation } from '../../app/queries';
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
	handleSubmit,
}: {
	siteSlug: string;
	newOwnerEmail: string;
	handleSubmit: ( data: ConfirmNewOwnerFormData ) => void;
} ) {
	const [ formData, setFormData ] = useState( {
		email: newOwnerEmail,
	} );

	const mutation = useMutation( siteOwnerTransferEligibilityCheckMutation( siteSlug ) );

	const isSaveDisabled = ! isItemValid( formData, fields, form );

	const onSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();

		mutation.mutate(
			{ new_site_owner: formData.email },
			{
				onSuccess: () => {
					handleSubmit( formData );
				},
				onError: () => {
					// TODO: Display error message below the field.
				},
			}
		);
	};

	return (
		<VStack spacing={ 1 }>
			<VStack style={ { padding: '8px 0' } }>
				<Text size="15px" weight={ 500 } lineHeight="32px">
					{ __( 'Confirm new owner' ) }
				</Text>
				<Text lineHeight="20px">
					{ createInterpolateElement(
						sprintf(
							/* translators: %(siteSlug)s - the current site slug */
							__(
								"Ready to transfer <strong>%(siteSlug)s</strong> and its associated purchases? Simply enter the new owner's email below, or choose an existing user to start the transfer process."
							),
							{
								siteSlug,
							}
						),
						{
							strong: <strong />,
						}
					) }
				</Text>
			</VStack>
			<form onSubmit={ onSubmit }>
				<VStack spacing={ 4 } style={ { padding: '8px 0' } }>
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
		</VStack>
	);
}
