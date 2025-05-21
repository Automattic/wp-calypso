import { DataForm, isItemValid } from '@automattic/dataviews';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { useState } from 'react';
import type { Field } from '@automattic/dataviews';

type ConfirmNewOwnerFormData = {
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
	handleSubmit,
}: {
	siteSlug: string;
	handleSubmit: ( event: React.FormEvent ) => void;
} ) {
	const [ formData, setFormData ] = useState( {
		email: '',
	} );

	const isSaveDisabled = ! isItemValid( formData, fields, form );

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
			<form onSubmit={ handleSubmit }>
				<VStack spacing={ 4 } style={ { padding: '8px 0' } }>
					<DataForm< ConfirmNewOwnerFormData >
						data={ formData }
						fields={ fields }
						form={ form }
						onChange={ ( edits: Partial< ConfirmNewOwnerFormData > ) => {
							setFormData( ( data ) => ( { ...data, ...edits } ) );
						} }
					/>
					<HStack justify="flex-start">
						<Button variant="primary" type="submit" disabled={ isSaveDisabled }>
							{ __( 'Continue' ) }
						</Button>
					</HStack>
				</VStack>
			</form>
		</VStack>
	);
}
