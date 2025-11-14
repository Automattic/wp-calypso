import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Icon,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { next, wordpress } from '@wordpress/icons';
import { Text } from '../../../components/text';
import GoogleLogo from '../../resources/google-logo';
import type { Email } from '../../types';
import type { Field } from '@wordpress/dataviews';

export const emailAddressField: Field< Email > = {
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
};
