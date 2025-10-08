import { Email } from '@automattic/api-core';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Icon,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { next, wordpress } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { purchasesRoute } from '../app/router/me';
import { Text } from '../components/text';
import {
	buildGoogleFinishSetupLink,
	buildGoogleMailboxLink,
	buildGoogleManageWorkspaceLink,
	buildTitanMailboxLink,
} from '../utils/email-utils';
import GoogleLogo from './resources/google-logo';
import MailboxIcon from './resources/mailbox-icon';
import type { Action, Field, View } from '@wordpress/dataviews';

// Shared fields for Emails DataViews
export const emailFields: Field< Email >[] = [
	{
		id: 'emailAddress',
		label: __( 'Email address' ),
		enableGlobalSearch: true,
		render: ( { item }: { item: Email } ) => {
			let iconEl = <Icon icon={ wordpress } size={ 28 } className="professional-email-icon" />;
			if ( item.type === 'forwarding' ) {
				iconEl = <Icon icon={ next } size={ 28 } className="email-forwarder-icon" />;
			}

			if ( item.type === 'mailbox' && item.provider === 'google_workspace' ) {
				iconEl = <GoogleLogo size={ 24 } className="google-workspace-email-icon" />;
			}

			return (
				<HStack spacing={ 4 } justify="flex-start">
					<div className="email-icon-wrapper">{ iconEl }</div>
					{ item.type === 'mailbox' ? (
						<span>{ item.emailAddress }</span>
					) : (
						<VStack justify="flex-start" className="email-redirect-field">
							<span>{ item.emailAddress }</span>
							<Text variant="muted">
								{ sprintf(
									/* translators: %s is the email messages will be forwarded to. */
									__( 'forwards to %s' ),
									item.forwardingTo
								) }
							</Text>
						</VStack>
					) }
				</HStack>
			);
		},
		getValue: ( { item }: { item: Email } ) => item.emailAddress,
	},
	{
		id: 'domainName',
		label: __( 'Domain' ),
		getValue: ( { item }: { item: Email } ) => item.domainName,
	},
	{
		id: 'type',
		label: __( 'Type' ),
		render: ( { item }: { item: Email } ) =>
			item.type === 'mailbox' ? __( 'Mailbox' ) : __( 'Forwarder' ),
		getValue: ( { item }: { item: Email } ) => item.type,
		elements: [
			{ value: 'mailbox', label: __( 'Mailbox' ) },
			{ value: 'forwarding', label: __( 'Forwarder' ) },
		],
	},
	{
		id: 'status',
		label: __( 'Status' ),
		render: ( { item }: { item: Email } ) => {
			if ( item.status === 'active' ) {
				return <Text intent="success">{ __( 'Active' ) }</Text>;
			}

			if ( item.status === 'unverified_forwards' ) {
				return <Text intent="warning">{ __( 'Pending verification' ) }</Text>;
			}

			if ( item.status === 'google_pending_tos_acceptance' ) {
				return <Text intent="warning">{ __( 'Action required' ) }</Text>;
			}

			if ( item.status === 'suspended' ) {
				return <Text intent="error">{ __( 'Expired' ) }</Text>;
			}

			// We can't handle un used mailboxes from a mailbox row because it's tied to the account.
			if ( item.status === 'unused_mailboxes' ) {
				return <Text intent="success">{ __( 'Active' ) }</Text>;
			}

			return <Text>{ item.status }</Text>;
		},
		getValue: ( { item }: { item: Email } ) => item.status,
		// map to display values for filtering UI
		elements: [
			{ value: 'active', label: __( 'Active' ) },
			{ value: 'pending', label: __( 'Pending verification' ) },
			{ value: 'pending', label: __( 'Finish setup' ) },
			{ value: 'suspended', label: __( 'Expired' ) },
		],
	},
];

export const DEFAULT_EMAILS_VIEW: View = {
	type: 'table',
	page: 1,
	perPage: 10,
	sort: { field: 'emailAddress', direction: 'asc' },
	fields: [ 'domainName', 'type', 'status' ],
	titleField: 'emailAddress',
};

// Factory to create shared actions for Emails DataViews
export function createEmailActions(
	navigate: ( arg: { to: string } ) => void,
	resendEmailForwardVerification: ( {
		domainName,
		mailbox,
		destination,
	}: {
		domainName: string;
		mailbox: string;
		destination: string;
	} ) => Promise< void >,
	deleteEmailForward: ( {
		domainName,
		mailbox,
		destination,
	}: {
		domainName: string;
		mailbox: string;
		destination: string;
	} ) => Promise< void >,
	deleteTitanMailbox: ( {
		domainName,
		mailbox,
	}: {
		domainName: string;
		mailbox: string;
	} ) => Promise< void >
) {
	return [
		{
			id: 'view-mailbox',
			label: __( 'View mailbox ↗' ),
			icon: <MailboxIcon className="mailbox--icon" />,
			isPrimary: true,
			callback: ( items: Email[] ) => {
				const item = items[ 0 ];
				if ( item.type === 'mailbox' && item.provider === 'titan' ) {
					const url = buildTitanMailboxLink( item.emailAddress );
					window.open( url, '_blank' );
				}

				if ( item.type === 'mailbox' && item.provider === 'google_workspace' ) {
					const url = buildGoogleMailboxLink( item.emailAddress, item.domainName );
					window.open( url, '_blank' );
				}
			},
			isEligible: ( item: Email ) => item.type === 'mailbox',
		},
		{
			id: 'finish-setup',
			label: __( 'Finish setup ↗' ),
			callback: ( items: Email[] ) => {
				const item = items[ 0 ];
				if ( item.status === 'google_pending_tos_acceptance' ) {
					const url = buildGoogleFinishSetupLink( item.emailAddress, item.domainName );
					window.open( url, '_blank' );
					return;
				}
			},
			isEligible: ( item: Email ) => item.status === 'google_pending_tos_acceptance',
		},
		{
			id: 'manage-google-workspace',
			label: __( 'Manage Google Workspace ↗' ),
			callback: ( item: Email[] ) => {
				const email = item[ 0 ];
				const url = buildGoogleManageWorkspaceLink( email.emailAddress, email.domainName );
				window.open( url, '_blank' );
			},
			isEligible: ( item: Email ) =>
				item.type === 'mailbox' && item.provider === 'google_workspace',
		},
		{
			id: 'payment-details',
			label: __( 'Manage billing and payments' ),
			callback: ( item: Email[] ) => {
				const email = item[ 0 ];
				navigate( { to: purchasesRoute.to + `/${ email.subscriptionId }` } );
			},
			isEligible: ( item: Email ) => item.type === 'mailbox',
		},
		{
			id: 'resend-verification',
			label: __( 'Resend verification' ),
			callback: ( items: Email[] ) => {
				const email = items[ 0 ];
				if ( email.type !== 'forwarding' || ! email?.forwardingTo ) {
					return;
				}

				const mailbox = email.emailAddress.split( '@' )[ 0 ];

				resendEmailForwardVerification( {
					domainName: email.domainName,
					mailbox,
					destination: email.forwardingTo as string,
				} );
			},
			isEligible: ( item: Email ) =>
				item.type === 'forwarding' && item.status === 'unverified_forwards',
		},
		{
			id: 'delete-titan-mailbox',
			label: __( 'Delete mailbox' ),
			isDestructive: true,
			// Using a modal to confirm deletion
			callback: () => {},
			RenderModal: ( { items, closeModal, onActionPerformed } ) => {
				const { createSuccessNotice } = useDispatch( noticesStore );
				const [ isBusy, setIsBusy ] = useState( false );
				const email = items[ 0 ];
				if ( email.type !== 'mailbox' || email.provider !== 'titan' ) {
					return null;
				}
				const mailbox = email.emailAddress.split( '@' )[ 0 ];
				const onConfirm = async () => {
					try {
						setIsBusy( true );
						await deleteTitanMailbox( {
							domainName: email.domainName,
							mailbox,
						} );
						createSuccessNotice(
							sprintf(
								/* translators: %s is the email address. */
								__( 'Mailbox %s has been scheduled for removal.' ),
								email.emailAddress
							),
							{ type: 'snackbar' }
						);
						onActionPerformed?.( items );
						closeModal?.();
					} finally {
						setIsBusy( false );
					}
				};
				return (
					<VStack spacing={ 4 }>
						<Text>
							{ sprintf(
								/* translators: %s is the email address to remove. */
								__( 'Are you sure you want to remove %s?' ),
								email.emailAddress
							) }
						</Text>
						<Text>
							{ __(
								'All your emails, calendar events, and contacts will be permanently deleted.'
							) }
						</Text>
						<HStack justify="right">
							<Button
								__next40pxDefaultSize
								variant="tertiary"
								onClick={ () => closeModal?.() }
								disabled={ isBusy }
								accessibleWhenDisabled
							>
								{ __( 'Cancel' ) }
							</Button>
							<Button
								__next40pxDefaultSize
								variant="primary"
								onClick={ onConfirm }
								isBusy={ isBusy }
								disabled={ isBusy }
								isDestructive
								accessibleWhenDisabled
							>
								{ __( 'Remove' ) }
							</Button>
						</HStack>
					</VStack>
				);
			},
			isEligible: ( item: Email ) => item.type === 'mailbox' && item.provider === 'titan',
		},
		{
			id: 'delete-email-forward',
			label: __( 'Delete forwarder' ),
			isDestructive: true,
			callback: () => {},
			RenderModal: ( { items, closeModal, onActionPerformed } ) => {
				const [ isBusy, setIsBusy ] = useState( false );
				const email = items[ 0 ];
				if ( email.type !== 'forwarding' || ! email?.forwardingTo ) {
					return null;
				}
				const mailbox = email.emailAddress.split( '@' )[ 0 ];
				const onConfirm = async () => {
					try {
						setIsBusy( true );
						await deleteEmailForward( {
							domainName: email.domainName,
							mailbox,
							destination: email.forwardingTo as string,
						} );
						onActionPerformed?.( items );
						closeModal?.();
					} finally {
						setIsBusy( false );
					}
				};
				return (
					<VStack spacing={ 4 }>
						<Text>
							{ sprintf(
								/* translators: %1$s is the email and %2$s is the forwarding destination address. */
								__( 'Emails sent to %1$s address will no longer be forwarded to %2$s.' ),
								email.emailAddress,
								email.forwardingTo
							) }
						</Text>
						<HStack justify="right">
							<Button
								__next40pxDefaultSize
								variant="tertiary"
								onClick={ () => closeModal?.() }
								disabled={ isBusy }
								accessibleWhenDisabled
							>
								{ __( 'Cancel' ) }
							</Button>
							<Button
								__next40pxDefaultSize
								variant="primary"
								onClick={ onConfirm }
								isBusy={ isBusy }
								disabled={ isBusy }
								accessibleWhenDisabled
								isDestructive
							>
								{ __( 'Remove' ) }
							</Button>
						</HStack>
					</VStack>
				);
			},
			isEligible: ( item: Email ) => item.type === 'forwarding',
		},
	] as Action< Email >[];
}
