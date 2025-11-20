import { checkSiteOwnerTransferEligibility } from '@automattic/api-core';
import { siteOwnerTransferEligibilityCheckMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { DataForm, useFormValidity } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { SectionHeader } from '../../components/section-header';
import type { Site } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

export type ConfirmNewOwnerFormData = {
	email: string;
};

const form = {
	layout: { type: 'regular' as const },
	fields: [ 'email' ],
};

const getFields = ( siteId: number ): Field< ConfirmNewOwnerFormData >[] => [
	{
		id: 'email',
		label: __( 'Email' ),
		type: 'email' as const,
		isValid: {
			required: true,
			custom: async ( data: ConfirmNewOwnerFormData ) => {
				try {
					await checkSiteOwnerTransferEligibility( siteId, {
						new_site_owner: data.email,
					} );
					return null;
				} catch ( error ) {
					if ( error instanceof Error ) {
						return error.message;
					}
					return (
						String( error ) ||
						sprintf(
							/* translators: %s is the new owner's email */
							__( 'Sorry, the site cannot be transferred to %s' ),
							data.email
						)
					);
				}
			},
		},
	},
];

export function ConfirmNewOwnerForm( {
	site,
	newOwnerEmail,
	onSubmit,
}: {
	site: Site;
	newOwnerEmail: string;
	onSubmit: ( data: ConfirmNewOwnerFormData ) => void;
} ) {
	const [ formData, setFormData ] = useState( {
		email: newOwnerEmail,
	} );

	const mutation = useMutation( siteOwnerTransferEligibilityCheckMutation( site.ID ) );

	const fields = getFields( site.ID );
	const { validity, isValid } = useFormValidity( formData, fields, form );
	const isSaveDisabled = ! isValid;

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
		if ( isValid ) {
			onSubmit( formData );
		}
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
								'Ready to transfer <siteSlug /> and its associated purchases? Simply enter the new owner’s email below, or choose an existing user to start the transfer process.'
							),
							{
								siteSlug: <strong>{ site.slug }</strong>,
							}
						) }
					</Text>
				</VStack>
				<DataForm< ConfirmNewOwnerFormData >
					data={ formData }
					fields={ fields }
					form={ form }
					validity={ validity }
					onChange={ ( edits: Partial< ConfirmNewOwnerFormData > ) => {
						setFormData( ( data ) => ( { ...data, ...edits } ) );
					} }
				/>
				<ButtonStack justify="flex-start">
					<Button
						variant="primary"
						type="submit"
						isBusy={ mutation.isPending }
						disabled={ isSaveDisabled }
					>
						{ __( 'Continue' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</form>
	);
}
