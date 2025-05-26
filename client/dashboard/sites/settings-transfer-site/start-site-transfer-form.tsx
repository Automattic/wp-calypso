import { DataForm } from '@automattic/dataviews';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import React, { useState } from 'react';
import type { Field } from '@automattic/dataviews';

type StartSiteTransferFormData = {
	accept_authorization: boolean;
	accept_transfer: boolean;
	accept_undone: boolean;
};

const fields: Field< StartSiteTransferFormData >[] = [
	{
		id: 'accept_authorization',
		label: __( 'I understand the changes that will be made once I authorize this transfer.' ),
		type: 'boolean' as const,
		Edit: 'checkbox',
	},
	{
		id: 'accept_transfer',
		label: __( 'I want to transfer the ownership of the site.' ),
		type: 'boolean' as const,
		Edit: 'checkbox',
	},
	{
		id: 'accept_undone',
		label: __( 'I understand that transferring a site cannot be undone.' ),
		type: 'boolean' as const,
		Edit: 'checkbox',
	},
];

const form = {
	type: 'regular' as const,
	fields: [ 'accept_authorization', 'accept_transfer', 'accept_undone' ],
};

export function StartSiteTransferForm( {
	initialData = {},
	siteSlug,
	newOwnerEmail,
	handleSubmit,
	handleBack,
}: {
	initialData?: Partial< StartSiteTransferFormData >;
	siteSlug: string;
	newOwnerEmail: string;
	handleSubmit: ( event: React.FormEvent ) => void;
	handleBack: () => void;
} ) {
	const [ formData, setFormData ] = useState( {
		accept_authorization: false,
		accept_transfer: false,
		accept_undone: false,
		...initialData,
	} );

	const isSaveDisabled = Object.values( formData ).some( ( value ) => ! value );

	return (
		<VStack spacing={ 0 }>
			<VStack style={ { padding: '8px 0 12px' } }>
				<Text size="15px" weight={ 500 } lineHeight="32px">
					{ __( 'Start site transfer' ) }
				</Text>
			</VStack>
			<VStack spacing={ 5 } style={ { padding: '8px 0' } }>
				{ /* TODO: Add notice when the component is ready */ }
				<VStack spacing={ 6 } style={ { padding: '8px 0' } }>
					<VStack>
						<Text weight={ 500 }>{ __( 'Content and ownership' ) }</Text>
						<ul style={ { paddingInlineStart: '20px', margin: 0 } }>
							<li>
								{ createInterpolateElement(
									sprintf(
										/* translators: %(siteSlug)s - the current site slug, %(newOwnerEmail)s - the new owner's email */
										__(
											'You’ll be removed as owner of <strong>%(siteSlug)s</strong> and <strong>%(newOwnerEmail)s</strong> will the new owner from now on.'
										),
										{ siteSlug, newOwnerEmail }
									),
									{
										strong: <strong />,
									}
								) }
							</li>
							<li>
								{ createInterpolateElement(
									sprintf(
										/* translators: %(newOwnerEmail)s - the new owner's email */
										__(
											'You will keep your admin access unless <strong>%(newOwnerEmail)s</strong> removes you.'
										),
										{ newOwnerEmail }
									),
									{
										strong: <strong />,
									}
								) }
							</li>
							<li>
								{ createInterpolateElement(
									sprintf(
										/* translators: %(siteSlug)s - the current site slug */
										__(
											'Your posts on <strong>%(siteSlug)s</strong> will remain authored by your account.'
										),
										{ siteSlug }
									),
									{
										strong: <strong />,
									}
								) }
							</li>
						</ul>
					</VStack>
					<VStack>
						<Text weight={ 500 }>{ __( 'Domains' ) }</Text>
						<ul style={ { paddingInlineStart: '20px', margin: 0 } }>
							<li>
								{ createInterpolateElement(
									sprintf(
										/* translators: %(siteSlug)s - the current site slug, %(newOwnerEmail)s - the new owner's email */
										__(
											'The domain name <strong>%(siteSlug)s</strong> will be transferred to <strong>%(newOwnerEmail)s</strong> and will remain working on the site.'
										),
										{ siteSlug, newOwnerEmail }
									),
									{
										strong: <strong />,
									}
								) }
							</li>
						</ul>
					</VStack>
				</VStack>
				<form onSubmit={ handleSubmit }>
					<VStack>
						<span style={ { textTransform: 'uppercase' } }>
							{ __( 'To transfer your site, review and accept the following statements:' ) }
						</span>
						<DataForm< StartSiteTransferFormData >
							data={ formData }
							fields={ fields }
							form={ form }
							onChange={ ( edits: Partial< StartSiteTransferFormData > ) => {
								setFormData( ( data ) => ( { ...data, ...edits } ) );
							} }
						/>
						<HStack justify="flex-start" style={ { paddingTop: '8px' } }>
							<Button variant="primary" type="submit" disabled={ isSaveDisabled }>
								{ __( 'Start transfer' ) }
							</Button>
							<Button variant="tertiary" onClick={ handleBack }>
								{ __( 'Back' ) }
							</Button>
						</HStack>
					</VStack>
				</form>
			</VStack>
		</VStack>
	);
}
