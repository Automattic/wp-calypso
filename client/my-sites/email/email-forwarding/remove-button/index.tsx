import {
	__experimentalConfirmDialog as ConfirmationDialog,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import useRemoveEmailForwardMutation from 'calypso/data/emails/use-remove-email-forward-mutation';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getEmailForwardAddress } from 'calypso/lib/emails';
import { Mailbox } from '../../../../data/emails/types';

export function RemoveButton( { mailbox }: { mailbox: Mailbox } ) {
	const { mutate: removeEmailForward } = useRemoveEmailForwardMutation( mailbox.domain );
	const translate = useTranslate();

	const remove = useCallback(
		( mailbox: string, domain: string, destination: string ) => {
			recordTracksEvent( 'calypso_email_management_email_forwarding_delete_click', {
				destination,
				domain_name: domain,
				mailbox: mailbox,
			} );

			removeEmailForward( {
				mailbox: mailbox,
				destination,
				domain,
			} );
		},
		[ removeEmailForward ]
	);

	const [ isOpen, setIsOpen ] = useState( false );

	const handleConfirm = () => {
		remove( mailbox.mailbox, mailbox.domain, getEmailForwardAddress( mailbox ) );
		setIsOpen( false );
	};

	const handleCancel = () => {
		setIsOpen( false );
	};

	return (
		<>
			<ConfirmationDialog
				isOpen={ isOpen }
				onConfirm={ handleConfirm }
				onCancel={ handleCancel }
				cancelButtonText={ translate( 'Cancel' ) }
				confirmButtonText={ translate( 'Remove' ) }
			>
				<VStack>
					<Heading level={ 3 }>
						{ translate( 'Are you sure you want to remove this email forward?' ) }
					</Heading>
					<Text>
						{ translate(
							"This will remove it from our records and if it's not used in another forward, it will require reverficiaton if added again."
						) }
					</Text>
				</VStack>
			</ConfirmationDialog>

			<PopoverMenuItem onClick={ () => setIsOpen( true ) }>
				{ translate( 'Remove' ) }
			</PopoverMenuItem>
		</>
	);
}
