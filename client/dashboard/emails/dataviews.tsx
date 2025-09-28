import { Email } from '@automattic/api-core';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	ExternalLink,
	Icon,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { next, wordpress } from '@wordpress/icons';
import { purchasesRoute } from '../app/router/me';
import GoogleLogo from '../sites/emails/resources/google-logo';
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
						<ExternalLink href={ `https://mail.${ item.domainName }` }>
							{ item.emailAddress }
						</ExternalLink>
					) : (
						<VStack justify="flex-start">
							<span>{ item.emailAddress }</span>
							<span className="text-muted">
								{ sprintf(
									/* translators: %s is the email messages will be forwarded to. */
									__( 'Forwards to %s' ),
									item.forwardingTo
								) }
							</span>
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
				return __( 'Active' );
			}
			if ( item.status === 'pending' ) {
				return __( 'Pending verification' );
			}
			if ( item.status === 'suspended' ) {
				return __( 'Expired' );
			}
			return item.status;
		},
		getValue: ( { item }: { item: Email } ) => item.status,
		// map to display values for filtering UI
		elements: [
			{ value: 'active', label: __( 'Active' ) },
			{ value: 'pending', label: __( 'Pending verification' ) },
			{ value: 'suspended', label: __( 'Expired' ) },
		],
	},
];

export const DEFAULT_EMAILS_VIEW: View = {
	type: 'table',
	page: 1,
	perPage: 10,
	sort: { field: 'emailAddress', direction: 'asc' },
	fields: [ 'type', 'status' ],
	titleField: 'emailAddress',
};

// Factory to create shared actions for Emails DataViews
export function createEmailActions(
	navigate: ( arg: any ) => void,
	setSelection: ( items: Email[] ) => void
) {
	return [
		{
			id: 'view-mailbox',
			label: __( 'View mailbox' ),
			icon: 'admin-site',
			callback: ( items: Email[] ) => {
				window.open( `https://mail.${ items[ 0 ].domainName }`, '_blank' );
			},
			isEligible: ( item: Email ) => item.type === 'mailbox',
		},
		{
			id: 'manage-subscription',
			label: __( 'Manage subscription' ),
			callback: () => {
				navigate( { to: purchasesRoute.to } );
			},
		},
		{
			id: 'resend-verification',
			label: __( 'Resend verification' ),
			callback: () => {
				// TODO: Wire mutation when available
				// resendForwarderVerificationMutation.mutate({ emailId })
			},
			isEligible: ( item: Email ) => item.type === 'forwarding' && item.status === 'pending',
		},
		{
			id: 'delete',
			label: __( 'Delete' ),
			isDestructive: true,
			callback: () => {
				// TODO: Wire mutation when available
				// deleteEmailMutation.mutate({ emailIds })
				setSelection( [] );
			},
		},
	] as Action< Email >[];
}
