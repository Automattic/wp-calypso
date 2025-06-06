import { DataForm, isItemValid } from '@automattic/dataviews';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
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

	const { createErrorNotice } = useDispatch( noticesStore );

	const isSaveDisabled = ! isItemValid( formData, fields, form );

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();

		mutation.mutate(
			{ new_site_owner: formData.email },
			{
				onSuccess: () => {
					onSubmit( formData );
				},
				onError: ( error ) => {
					// TODO: Show the error via Data Form when the ValidatedTextControl is ready.
					createErrorNotice(
						error.message ??
							sprintf(
								/* translators: %s is the new owner's email */
								__( 'Sorry, the site cannot be transferred to %s' ),
								formData.email
							),
						{
							type: 'snackbar',
						}
					);
				},
			}
		);
	};

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 4 }>
				<VStack>
					<SectionHeader title={ __( 'Confirm new owner' ) } level={ 3 } />
					{ /* The description in SectionHeader appears in gray-700, so we need to use the Text component to apply that color explicitly. */ }
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
	);
}
