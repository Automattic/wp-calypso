import { DataForm } from '@automattic/dataviews';
import { useQuery } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Card,
	CardBody,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { useState } from 'react';
import { siteQuery } from '../../app/queries';
import PageLayout from '../../components/page-layout';
import { useCanTransferSite } from '../hooks/use-can-transfer-site';
import SettingsPageHeader from '../settings-page-header';
import type { Field, SimpleFormField } from '@automattic/dataviews';

type FormData = {
	email: string;
};

const fields: Field< FormData >[] = [
	{
		id: 'email',
		label: __( 'Email' ),
		type: 'text' as const,
	},
];

const form = {
	type: 'regular' as const,
	fields: [ { id: 'email' } as SimpleFormField ],
};

export default function SettingsTransferSite( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useQuery( siteQuery( siteSlug ) );
	const canTransferSite = useCanTransferSite( { site } );
	const [ formData, setFormData ] = useState( {
		email: '',
	} );

	// TODO: Integrate with the API.
	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
	};

	if ( ! site ) {
		return null;
	}

	if ( ! canTransferSite ) {
		throw notFound();
	}

	return (
		<PageLayout
			size="small"
			header={
				<SettingsPageHeader
					title={ __( 'Transfer site' ) }
					description={ __( 'Transfer ownership of this site to another WordPress.com user.' ) }
				/>
			}
		>
			<Card>
				<CardBody>
					<VStack>
						<Text size="15px" weight={ 500 } lineHeight="20px">
							{ __( 'Confirm new owner' ) }
						</Text>
						<Text variant="muted" lineHeight="20px">
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
						<form onSubmit={ handleSubmit }>
							<VStack spacing={ 4 }>
								<DataForm< FormData >
									data={ formData }
									fields={ fields }
									form={ form }
									onChange={ ( edits: FormData ) => {
										setFormData( ( data ) => ( { ...data, ...edits } ) );
									} }
								/>
								<HStack justify="flex-start">
									<Button variant="primary" type="submit">
										{ __( 'Continue' ) }
									</Button>
								</HStack>
							</VStack>
						</form>
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
