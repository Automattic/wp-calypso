import { useSuspenseQuery } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { DataForm, isItemValid } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { domainQuery } from '../../app/queries/domain';
import { domainTransferRequestQuery } from '../../app/queries/domain-transfer';
import { siteByIdQuery } from '../../app/queries/site';
import { domainRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { hasGSuiteWithUs, hasTitanMailWithUs } from '../../utils/domain';
import type { Field } from '@wordpress/dataviews';

export type TransferFormData = {
	email: string;
};

const fields: Field< TransferFormData >[] = [
	{
		id: 'email',
		label: __( 'Email' ),
		type: 'email' as const,
		isValid: {
			required: true,
		},
	},
];

const form = {
	layout: { type: 'regular' as const },
	fields: [ 'email' ],
};

export default function TransferDomainToAnyUser() {
	const { domainName } = domainRoute.useParams() as { domainName: string };
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: site } = useSuspenseQuery( siteByIdQuery( domain.blog_id ) );
	const { data: domainTransferRequest } = useSuspenseQuery(
		domainTransferRequestQuery( domainName, site.slug )
	);
	const transferEmail = domainTransferRequest?.email;

	const [ formData, setFormData ] = useState( {
		email: '',
	} );

	const hasEmailWithUs = hasTitanMailWithUs( domain ) || hasGSuiteWithUs( domain );

	const isSaveDisabled = ! isItemValid( formData, fields, form );

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
		// eslint-disable-next-line no-console
		console.log( 'Transfer domain to email:', formData.email );
	};

	const renderEmailForm = () => {
		return (
			<form onSubmit={ handleSubmit }>
				<VStack spacing={ 4 }>
					<DataForm< TransferFormData >
						data={ formData }
						fields={ fields }
						form={ form }
						onChange={ ( edits: Partial< TransferFormData > ) => {
							setFormData( ( data ) => ( { ...data, ...edits } ) );
						} }
					/>
					<HStack justify="flex-start">
						<Button variant="primary" type="submit" disabled={ isSaveDisabled }>
							{ __( 'Transfer Domain' ) }
						</Button>
					</HStack>
				</VStack>
			</form>
		);
	};

	const renderDeleteForm = () => {
		return <>Placeholder</>;
	};

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Transfer to another user' ) } /> }>
			<Card>
				<CardBody>
					<VStack spacing={ 2 }>
						<SectionHeader title={ __( 'Confirm new owner' ) } level={ 3 } />
						<Text as="p">
							{ sprintf(
								/* Translators: %s: domainName is the domain name */
								__(
									'You can transfer %(domainName)s to any WordPress.com user. If the user does not have a WordPress.com account, they will be prompted to create one.'
								),
								{ domainName }
							) }
						</Text>
						{ hasEmailWithUs && (
							<Text as="p">
								{ sprintf(
									/* Translators: %s: domainName is the domain name */
									__(
										'The email subscription for %(domainName)s will be transferred along with the domain.'
									),
									{ domainName }
								) }
							</Text>
						) }
					</VStack>
					{ transferEmail && renderEmailForm() }
					{ ! transferEmail && renderDeleteForm() }
				</CardBody>
			</Card>
		</PageLayout>
	);
}
