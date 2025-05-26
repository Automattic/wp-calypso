import { useMutation } from '@tanstack/react-query';
import { ExternalLink, Spinner } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { siteOwnerTransferConfirmMutation } from '../../app/queries';
import Notice from '../../components/notice';
import type { SiteTransferResponse } from '../../data/types';

export function InvitationEmailSent( {
	siteSlug,
	confirmationHash,
}: {
	siteSlug: string;
	confirmationHash: string;
} ) {
	const [ newOwnerEmail, setNewOwnerEmail ] = useState( '' );
	const [ hasError, setHasError ] = useState( false );
	const mutation = useMutation( siteOwnerTransferConfirmMutation( siteSlug ) );

	useEffect( () => {
		mutation.mutate(
			{ hash: confirmationHash },
			{
				onSuccess: ( { email_sent_to }: SiteTransferResponse ) => {
					setNewOwnerEmail( email_sent_to );
				},
				onError: () => {
					setHasError( true );
				},
			}
		);
	}, [ confirmationHash ] );

	if ( ! newOwnerEmail || mutation.isPending ) {
		return <Spinner />;
	}

	if ( hasError ) {
		return (
			<Notice
				variant="error"
				content={ createInterpolateElement(
					__( 'There was an error confirming the site transfer. Please <supportLink /> for help.' ),
					{
						supportLink: (
							<ExternalLink href="/help">{ __( 'contact our support team' ) }</ExternalLink>
						),
					}
				) }
			/>
		);
	}

	return (
		<Notice
			variant="success"
			title={ createInterpolateElement(
				sprintf(
					/* translators: %(newOwnerEmail)s - the current user's email */
					__( 'Invitation sent to <strong>%(newOwnerEmail)s</strong>' ),
					{
						newOwnerEmail,
					}
				),
				{
					strong: <strong />,
				}
			) }
			content={ __(
				'They will need to visit the link included in the email invitation for the site transfer to complete. The invitation will expire in 7 days.'
			) }
		/>
	);
}
