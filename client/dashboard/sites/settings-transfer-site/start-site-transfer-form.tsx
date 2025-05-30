import { DataForm } from '@automattic/dataviews';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import React, { useState } from 'react';
import { siteOwnerTransferMutation } from '../../app/queries';
import Notice from '../../components/notice';
import type { Site } from '../../data/types';
import type { Field } from '@automattic/dataviews';

export type StartSiteTransferFormData = {
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

const List = ( { title, children }: { title: string; children: React.ReactNode } ) => {
	return (
		<VStack>
			<Text weight={ 500 } as="h3">
				{ title }
			</Text>
			<ul style={ { paddingInlineStart: '20px', margin: 0 } }>{ children }</ul>
		</VStack>
	);
};

export function StartSiteTransferForm( {
	siteSlug,
	site,
	newOwnerEmail,
	onSubmit,
	onBack,
}: {
	siteSlug: string;
	site: Site;
	newOwnerEmail: string;
	onSubmit: () => void;
	onBack: () => void;
} ) {
	const [ formData, setFormData ] = useState( {
		accept_authorization: false,
		accept_transfer: false,
		accept_undone: false,
	} );

	const mutation = useMutation( siteOwnerTransferMutation( siteSlug ) );

	const isSaveDisabled = Object.values( formData ).some( ( value ) => ! value );

	const renderSiteSlug = () => <strong>{ siteSlug }</strong>;

	const renderNewOwnerEmail = () => <strong>{ newOwnerEmail }</strong>;

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();

		mutation.mutate(
			{ new_site_owner: newOwnerEmail },
			{
				onSuccess: () => {
					onSubmit();
				},
				onError: () => {
					// TODO: Display error message
				},
			}
		);
	};

	return (
		<VStack spacing={ 0 }>
			<VStack style={ { padding: '8px 0 12px' } }>
				<Text size="15px" weight={ 500 } lineHeight="32px" as="h2">
					{ __( 'Start site transfer' ) }
				</Text>
			</VStack>
			<VStack spacing={ 5 } style={ { padding: '8px 0' } }>
				<Notice variant="warning" density="medium">
					{ __( 'Please read the following carefully. Transferring a site cannot be undone.' ) }
				</Notice>
				<VStack spacing={ 6 } style={ { padding: '8px 0' } }>
					<List title={ __( 'Content and ownership' ) }>
						<li>
							{ createInterpolateElement(
								__(
									'You’ll be removed as owner of <siteSlug /> and <newOwnerEmail /> will the new owner from now on.'
								),
								{
									siteSlug: renderSiteSlug(),
									newOwnerEmail: renderNewOwnerEmail(),
								}
							) }
						</li>
						<li>
							{ createInterpolateElement(
								__( 'You will keep your admin access unless <newOwnerEmail /> removes you.' ),
								{
									newOwnerEmail: renderNewOwnerEmail(),
								}
							) }
						</li>
						<li>
							{ createInterpolateElement(
								__( 'Your posts on <siteSlug /> will remain authored by your account.' ),
								{
									siteSlug: renderSiteSlug(),
								}
							) }
						</li>
						{ site.is_wpcom_atomic && ! site.is_wpcom_staging_site && (
							<li>
								{ createInterpolateElement(
									__(
										'If your site <siteSlug /> has a staging site, it will be transferred to <newOwnerEmail />.'
									),
									{
										siteSlug: renderSiteSlug(),
										newOwnerEmail: renderNewOwnerEmail(),
									}
								) }
							</li>
						) }
					</List>
					{ /* TODO: Check there is any active purchase on current user. */ }
					<List title={ __( 'Upgrades' ) }>
						<li>
							{ createInterpolateElement(
								__(
									'Your paid upgrades on <siteSlug /> will be transferred to <newOwnerEmail /> and will remain with the site.'
								),
								{
									siteSlug: renderSiteSlug(),
									newOwnerEmail: renderNewOwnerEmail(),
								}
							) }
						</li>
					</List>
					<List title={ __( 'Domains' ) }>
						<li>
							{ createInterpolateElement(
								__(
									'The domain name <siteSlug /> will be transferred to <newOwnerEmail /> and will remain working on the site.'
								),
								{
									siteSlug: renderSiteSlug(),
									newOwnerEmail: renderNewOwnerEmail(),
								}
							) }
						</li>
					</List>
				</VStack>
				<form onSubmit={ handleSubmit }>
					<VStack>
						<span style={ { textTransform: 'uppercase', fontSize: '11px', fontWeight: 500 } }>
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
							<Button
								variant="primary"
								type="submit"
								isBusy={ mutation.isPending }
								disabled={ isSaveDisabled }
							>
								{ __( 'Start transfer' ) }
							</Button>
							<Button variant="tertiary" onClick={ onBack } disabled={ mutation.isPending }>
								{ __( 'Back' ) }
							</Button>
						</HStack>
					</VStack>
				</form>
			</VStack>
		</VStack>
	);
}
