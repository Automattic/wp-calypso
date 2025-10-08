import { addEmailForwarderMutation, domainsQuery } from '@automattic/api-queries';
import { CALYPSO_CONTACT } from '@automattic/urls';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __experimentalVStack as VStack, Button, Card, CardBody } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, isItemValid } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { arrowLeft } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
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
	localPart: string;
	domain: string;
	forwardingAddresses: string[];
}

function AddEmailForwarder() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { mutate: addEmailForwarder, isPending } = useMutation( addEmailForwarderMutation() );
	const navigate = useNavigate();
	const { data: domains, isLoading } = useQuery( domainsQuery() );
	const [ formData, setFormData ] = useState< FormData >( {
		localPart: '',
		domain: '',
		forwardingAddresses: [],
	} );
	const isBusy = isLoading || isPending;

	const fields: Field< FormData >[] = useMemo(
		() => [
			{
				id: 'localPart',
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
				id: 'forwardingAddresses',
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
				children: [ 'localPart', 'domain' ],
				id: 'email_address',
				layout: {
					type: 'row' as const,
				},
			},
			'forwardingAddresses',
		],
	};

	const allFieldsSet = formData.localPart && formData.domain && formData.forwardingAddresses.length;
	const isValid = isItemValid( formData, fields, form );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		if ( ! isValid ) {
			return;
		}

		const { localPart, domain, forwardingAddresses } = formData;

		addEmailForwarder(
			{
				domain,
				mailbox: `${ localPart }@${ domain }`,
				destinations: forwardingAddresses,
			},
			{
				onSuccess: () => {
					createSuccessNotice( __( 'Email forwarder added.' ), { type: 'snackbar' } );
					navigate( {
						to: '/emails',
					} );
				},
				onError: ( resp, variables ) => {
					if ( resp ) {
						const message =
							typeof resp.message === 'object' ? resp.message.error_message : resp.message;

						createErrorNotice(
							sprintf(
								/* Translators: %s: emailAddress is the email address the user was attempting to add a forwarder for, %s: message is the error message returned by the API */
								__(
									'Failed to add email forwarder for %(emailAddress)s with message "%(message)s". Please try again or contact support.'
								),
								{
									emailAddress: variables.mailbox,
									message,
								}
							),
							{ actions: [ { label: __( 'Support' ), url: CALYPSO_CONTACT } ], type: 'snackbar' }
						);
					} else {
						createErrorNotice(
							sprintf(
								/* Translators: %s: emailAddress is the email address the user was attempting to add a forwarder for */
								__(
									'Failed to add email forwarder for %(emailAddress)s. Please try again or contact support.'
								),
								{
									emailAddress: variables.mailbox,
								}
							),
							{ actions: [ { label: __( 'Support' ), url: CALYPSO_CONTACT } ], type: 'snackbar' }
						);
					}
				},
			}
		);
	};

	return (
		<PageLayout
			header={
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
