import { addEmailForwarderMutation, domainsQuery } from '@automattic/api-queries';
import { useQuery, useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button, Card, CardBody } from '@wordpress/components';
import { DataForm, isItemValid } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { arrowLeft } from '@wordpress/icons';
import { useMemo, useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { OptInWelcome } from '../../components/opt-in-welcome';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { Text } from '../../components/text';
import type { Field } from '@wordpress/dataviews';

import '../style.scss';

export interface FormData {
	local_part: string;
	domain: string;
	forwarding_addresses: string[];
}

function AddEmailForwarder() {
	const { data: domains, isLoading } = useQuery( domainsQuery() );
	const { mutate: addEmailForwarder, isPending } = useMutation( addEmailForwarderMutation() );
	const [ formData, setFormData ] = useState< FormData >( {
		local_part: '',
		domain: '',
		forwarding_addresses: [],
	} );
	const isBusy = isLoading || isPending;

	const fields: Field< FormData >[] = useMemo(
		() => [
			{
				id: 'local_part',
				label: __( 'Email address' ),
				type: 'text',
			},
			{
				elements:
					domains
						?.filter( ( d ) => d.current_user_is_owner )
						.map( ( d ) => ( { label: d.domain, value: d.domain } ) ) || [],
				id: 'domain',
				label: __( 'Domain' ),
				type: 'text',
			},
			{
				id: 'forwarding_addresses',
				label: __( 'Forward to' ),
				type: 'array',
			},
		],
		[ domains ]
	);

	const form = {
		layout: { type: 'regular' as const },
		fields: [
			{
				children: [ 'local_part', 'domain' ],
				id: 'email_address',
				layout: {
					type: 'row' as const,
				},
			},
			'forwarding_addresses',
		],
	};

	const allFieldsSet =
		formData.local_part && formData.domain && formData.forwarding_addresses.length;
	const isValid = isItemValid( formData, fields, form );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		if ( ! isValid ) {
			return;
		}

		const { local_part, domain, forwarding_addresses } = formData;

		addEmailForwarder( {
			domain,
			mailbox: `${ local_part }@${ domain }`,
			destinations: forwarding_addresses,
		} );
	};

	return (
		<PageLayout
			header={
				<>
					<PageHeader
						prefix={
							<RouterLinkButton
								className="add-forwarder__back-button"
								icon={ arrowLeft }
								iconSize={ 12 }
								to="/emails"
							>
								<Text variant="muted">{ __( 'Emails' ) }</Text>
							</RouterLinkButton>
						}
					/>
				</>
			}
			notices={ <OptInWelcome tracksContext="emails" /> }
			size="small"
		>
			<Card>
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<VStack spacing={ 6 }>
							<VStack spacing={ 2 }>
								<DataForm
									data={ formData }
									fields={ fields }
									form={ form }
									onChange={ ( edits: Partial< FormData > ) => {
										setFormData( ( data ) => ( { ...data, ...edits } ) );
									} }
								/>
							</VStack>

							<ButtonStack justify="flex-start">
								<Button
									variant="primary"
									type="submit"
									isBusy={ isBusy }
									disabled={ isBusy || ! allFieldsSet || ! isValid }
								>
									{ __( 'Save' ) }
								</Button>
							</ButtonStack>
						</VStack>
					</form>
				</CardBody>
			</Card>
		</PageLayout>
	);
}

export default AddEmailForwarder;
