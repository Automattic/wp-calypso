import { addEmailForwarderMutation } from '@automattic/api-queries';
import { CALYPSO_CONTACT } from '@automattic/urls';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
	ExternalLink,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, isItemValid } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { arrowLeft } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { Text } from '../../components/text';
import { useDomains } from '../hooks/use-domains';
import { useDomainMaxForwards } from './hooks/use-domain-max-forwards';
import { useNewForwardingAddresses } from './hooks/use-new-forwarding-addresses';
import type { Field } from '@wordpress/dataviews';

import '../style.scss';

export interface FormData {
	localPart: string;
	domain: string;
	forwardingAddresses: string[];
}

function AddEmailForwarder() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
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
	const { isLoading: isLoadingNewForwardingAddresses, newForwardingAddresses } =
		useNewForwardingAddresses( {
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
	const isDomainMaxForwardsReached = ( forwards?.length ?? 0 ) >= maxForwards;
	const willDomainMaxForwardsBeReached =
		( forwards?.length ?? 0 ) + formData.forwardingAddresses.length > maxForwards;

	const isValid =
		isItemValid( formData, fields, form ) &&
		! isDomainMaxForwardsReached &&
		! willDomainMaxForwardsBeReached;

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
			size="small"
		>
			<Card>
				<CardBody>
					{ eligibleDomains.length === 0 ? (
						<Text>{ __( 'You do not have any domains eligible for email forwarding.' ) }</Text>
					) : (
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
										{ createInterpolateElement(
											__(
												"You can't add another email forwarder for this domain because you've reached the maximum number (<maxForwards />) of Email Forwards allowed on it. Please <manageForwadersLink>delete an existing forwarder</manageForwadersLink> to add a new one."
											),
											{
												manageForwadersLink: (
													<ExternalLink
														href={ `/email/${ formData.domain }/manage/${ formData.domain }` }
														children={ null }
													/>
												),
												maxForwards: <>{ maxForwards }</>,
											}
										) }
									</Notice>
								) }
								{ ! isDomainMaxForwardsReached && willDomainMaxForwardsBeReached && (
									<Notice variant="warning">
										{ createInterpolateElement(
											__(
												'You are adding too many new email forwarders for this domain (<forwardingAddressesCount/>); the maximum number is <maxForwards /> and there are already <existingForwardersCount/> before this change. Please edit your changes or <manageForwadersLink>delete any of the existing forwarders</manageForwadersLink>.'
											),
											{
												manageForwadersLink: (
													<ExternalLink
														href={ `/email/${ formData.domain }/manage/${ formData.domain }` }
														children={ null }
													/>
												),
												forwardingAddressesCount: <>{ formData.forwardingAddresses.length }</>,
												maxForwards: <>{ maxForwards }</>,
												existingForwardersCount: <>{ forwards && forwards.length }</>,
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
					) }
				</CardBody>
			</Card>
		</PageLayout>
	);
}

export default AddEmailForwarder;
