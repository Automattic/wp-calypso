import { useMutation } from '@tanstack/react-query';
import { ExternalLink, Spinner } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { siteOwnerTransferConfirmMutation } from '../../app/queries';
import Notice from '../../components/notice';
import type { SiteTransferConfirmation } from '../../data/types';

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

	// The page is accessed via the confirmation email, so this is the only place where the request can be triggered.
	// It would be better if
	// * we have the server trigger the mutation before rendering the page
	// * we first show a page, clarifying what is going to happen with an "accept" button or something.
	useEffect( () => {
		mutation.mutate(
			{ hash: confirmationHash },
			{
				onSuccess: ( { new_owner_email }: SiteTransferConfirmation ) => {
					setNewOwnerEmail( new_owner_email );
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
			<Notice variant="error">
				{ createInterpolateElement(
					__( 'There was an error confirming the site transfer. Please <supportLink /> for help.' ),
					{
						supportLink: (
							<ExternalLink href="/help">{ __( 'contact our support team' ) }</ExternalLink>
						),
					}
				) }
			</Notice>
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
		>
			{ __(
				'They will need to visit the link included in the email invitation for the site transfer to complete. The invitation will expire in 7 days.'
			) }
		</Notice>
	);
}
