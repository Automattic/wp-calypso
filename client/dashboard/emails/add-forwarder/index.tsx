import { addEmailForwarderMutation } from '@automattic/api-queries';
import { CALYPSO_CONTACT } from '@automattic/urls';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, isItemValid } from '@wordpress/dataviews';
import { __, _n, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useAppContext } from '../../app/context';
import { emailsRoute } from '../../app/router/emails';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import AddNewDomain from '../components/add-new-domain';
import { BackToEmailsPrefix } from '../components/back-to-emails-prefix';
import { useDomains } from '../hooks/use-domains';
import { DEFAULT_MAX_DOMAIN_FORWARDS, useDomainMaxForwards } from './hooks/use-domain-max-forwards';
import { useForwardingAddresses } from './hooks/use-forwarding-addresses';
import type { Field } from '@wordpress/dataviews';

import '../style.scss';

export interface FormData {
	localPart: string;
	domain: string;
	forwardingAddresses: string[];
}

function AddEmailForwarder() {
	const { basePath } = useAppContext();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { recordTracksEvent } = useAnalytics();

	const { mutate: addEmailForwarder, isPending: isAddingEmailForwarder } = useMutation(
		addEmailForwarderMutation()
	);
	const navigate = useNavigate();
	const { domains, isLoading: isLoadingDomains } = useDomains();

	const eligibleDomains = useMemo(
		() =>
			domains?.filter(
				( {
					current_user_can_add_email,
					current_user_is_owner,
					google_apps_subscription,
					titan_mail_subscription,
					wpcom_domain,
				} ) =>
					current_user_can_add_email &&
					current_user_is_owner &&
					google_apps_subscription?.status === 'no_subscription' &&
					titan_mail_subscription?.status === 'no_subscription' &&
					! wpcom_domain
			) || [],
		[ domains ]
	);

	const [ formData, setFormData ] = useState< FormData >( {
		localPart: '',
		domain: '',
		forwardingAddresses: [],
	} );
	const {
		isLoading: isLoadingNewForwardingAddresses,
		forwardsByMailbox,
		newForwardingAddresses,
	} = useForwardingAddresses( {
		domains: eligibleDomains,
		forwardingAddresses: formData.forwardingAddresses,
	} );
	const {
		isLoading: isLoadingDomainMaxForwards,
		forwards,
		maxForwards,
	} = useDomainMaxForwards( formData.domain );

	const fields: Field< FormData >[] = useMemo(
		() => [
			{
				id: 'localPart',
				label: __( 'Email address' ),
				type: 'text',
			},
			{
				elements: [
					{
						label: __( 'Select a domain' ),
						value: '',
					},
					...( eligibleDomains.map( ( d ) => ( { label: d.domain, value: d.domain } ) ) || [] ),
				],
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
		[ eligibleDomains ]
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

	const isBusy =
		isAddingEmailForwarder ||
		isLoadingDomains ||
		isLoadingDomainMaxForwards ||
		isLoadingNewForwardingAddresses;
	const allFieldsSet = formData.localPart && formData.domain && formData.forwardingAddresses.length;

	const isDomainMaxForwardsReached =
		( forwards?.length ?? 0 ) >= ( maxForwards ?? DEFAULT_MAX_DOMAIN_FORWARDS );
	const willDomainMaxForwardsBeReached =
		( forwards?.length ?? 0 ) + formData.forwardingAddresses.length >
		( maxForwards ?? DEFAULT_MAX_DOMAIN_FORWARDS );

	const duplicateForwardAddress = formData.forwardingAddresses.find(
		( addr ) => forwardsByMailbox.get( `${ formData.localPart }@${ formData.domain }` ) === addr
	);

	const isValid =
		isItemValid( formData, fields, form ) &&
		! isDomainMaxForwardsReached &&
		! willDomainMaxForwardsBeReached &&
		! duplicateForwardAddress;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		if ( ! isValid ) {
			return;
		}

		const { localPart, domain, forwardingAddresses } = formData;

		recordTracksEvent( 'calypso_dashboard_emails_add_forwarder_save_click' );
		const redirectPath = `${ ( basePath || '' ).replace( /\/$/, '' ) }${ emailsRoute.to }`;
		const redirectUrl =
			typeof window !== 'undefined'
				? new URL( redirectPath, window.location.origin ).href
				: redirectPath;

		addEmailForwarder(
			{
				domain,
				mailbox: `${ localPart }@${ domain }`,
				destinations: forwardingAddresses,
				redirectUrl,
			},
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_dashboard_emails_add_forwarder_save_success' );
					createSuccessNotice( __( 'Email forwarder added.' ), { type: 'snackbar' } );
					navigate( {
						to: '/emails',
					} );
				},
				onError: ( resp, variables ) => {
					recordTracksEvent( 'calypso_dashboard_emails_add_forwarder_save_error' );
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
		<PageLayout header={ <PageHeader prefix={ <BackToEmailsPrefix /> } /> } size="small">
			{ eligibleDomains.length === 0 ? (
				<>
					<Text size={ 16 }>
						{ __( 'You do not have any domains eligible for email forwarding.' ) }
					</Text>
					<AddNewDomain origin="add-forwarder" />
				</>
			) : (
				<>
					<Text size={ 16 }>{ __( 'Set where your emails should be forwarded.' ) }</Text>
					<Card>
						<CardBody>
							<form onSubmit={ handleSubmit }>
								<VStack spacing={ 6 }>
									<DataForm
										data={ formData }
										fields={ fields }
										form={ form }
										onChange={ ( edits: Partial< FormData > ) => {
											setFormData( ( data ) => ( { ...data, ...edits } ) );
										} }
									/>

									{ newForwardingAddresses.length > 0 && (
										<Notice>
											{ sprintf(
												/* Translators: %s: emailAddress is the email address the user was attempting to add a forwarder for */
												_n(
													"This is the first time you've set up an email forwarder to %(emailAddresses)s. Look out for a verification email to confirm you have access to that email after saving.",
													"This is the first time you've set up an email forwarder to %(emailAddresses)s. Look out for a verification email to confirm you have access to those emails after saving.",
													newForwardingAddresses.length
												),
												{
													emailAddresses: newForwardingAddresses.join( ', ' ),
												}
											) }
										</Notice>
									) }

									{ isDomainMaxForwardsReached && (
										<Notice variant="warning">
											{ sprintf(
												// translators: %(maxForwards) is the maximum number of email forwards allowed for a domain.
												__(
													"You can't add another email forwarder for this domain because you've reached the maximum number %(maxForwards)d of Email Forwards allowed on it. Please delete an existing forwarder in order to add a new one."
												),
												{
													maxForwards,
												}
											) }
										</Notice>
									) }

									{ ! isDomainMaxForwardsReached && willDomainMaxForwardsBeReached && (
										<Notice variant="warning">
											{ sprintf(
												// translators: %(forwardingAddressesCount)d is the number of new email forwards the user is attempting to add, %(maxForwards)d is the maximum number of email forwards allowed for a domain, %(existingForwardersCount)d is the number of existing email forwards already set up for the domain.
												__(
													'You are adding too many new email forwarders for this domain (%(forwardingAddressesCount)d); the maximum number is %(maxForwards)d and there are already %(existingForwardersCount)d before this change. Please edit your changes or delete any of the existing forwarders.'
												),
												{
													forwardingAddressesCount: formData.forwardingAddresses.length,
													maxForwards,
													existingForwardersCount: forwards?.length ?? 0,
												}
											) }
										</Notice>
									) }

									{ duplicateForwardAddress && (
										<Notice variant="error">
											{ sprintf(
												// translators: %(mailbox)s is the email address the user is attempting to add a forwarder for, %(forwardingAddress)s is the duplicate forwarding email address.
												__(
													'There is already a forwarding set from %(mailbox)s to %(forwardingAddress)s. Please remove the duplicate and try again.'
												),
												{
													mailbox: `${ formData.localPart }@${ formData.domain }`,
													forwardingAddress: duplicateForwardAddress,
												}
											) }
										</Notice>
									) }

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
				</>
			) }
		</PageLayout>
	);
}

export default AddEmailForwarder;
