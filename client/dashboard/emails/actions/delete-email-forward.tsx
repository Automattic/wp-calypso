import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { Text } from '../../components/text';
import type { Email } from '../types';
import type { Action } from '@wordpress/dataviews';

export const buildDeleteEmailForwardAction = (
	deleteEmailForward: ( {
		domainName,
		mailbox,
		destination,
	}: {
		domainName: string;
		mailbox: string;
		destination: string;
	} ) => Promise< void >
): Action< Email > => ( {
	id: 'delete-email-forward',
	label: __( 'Delete forwarder' ),
	isDestructive: true,
	callback: () => {},
	RenderModal: ( { items, closeModal, onActionPerformed } ) => {
		const [ isBusy, setIsBusy ] = useState( false );
		const email = items[ 0 ];
		if ( email.type !== 'forwarding' || ! email?.forwardingTo ) {
			return <></>;
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
} );
