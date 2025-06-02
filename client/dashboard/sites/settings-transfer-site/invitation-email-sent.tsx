import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { ExternalLink, Spinner } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
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
	const { createSuccessNotice } = useDispatch( noticesStore );
	const router = useRouter();

	// The page is accessed via the confirmation email, so this is the only place where the request can be triggered.
	// It would be better if
	// * we have the server trigger the mutation before rendering the page
	// * we first show a page, clarifying what is going to happen with an "accept" button or something.
	useEffect( () => {
		mutation.mutate(
			{ hash: confirmationHash },
			{
				onSuccess: ( { transfer, new_owner_email }: SiteTransferConfirmation ) => {
					if ( transfer ) {
						createSuccessNotice(
							sprintf(
								/* translators: %(newOwnerEmail)s - the new owner's email */
								__( 'The site has been successfully transferred to %(newOwnerEmail)s.' ),
								{
									newOwnerEmail: new_owner_email,
								}
							),
							{ type: 'snackbar' }
						);
						router.navigate( { to: '/sites', replace: true } );
						return;
					}

					setNewOwnerEmail( new_owner_email );
				},
				onError: () => {
					setHasError( true );
				},
			}
		);
	}, [ confirmationHash ] );

	if ( hasError ) {
		return (
			<Notice variant="error">
				{ createInterpolateElement(
					__(
						'There was an error confirming the site transfer. Please <link>contact our support team</link> for help.'
					),
					{
						link: (
							// @ts-expect-error children prop is injected by createInterpolateElement
							<ExternalLink href="/help" />
						),
					}
				) }
			</Notice>
		);
	}

	if ( ! newOwnerEmail || mutation.isPending ) {
		return <Spinner />;
	}

	return (
		<Notice
			variant="success"
			title={ createInterpolateElement( __( 'Invitation sent to <newOwnerEmail />' ), {
				newOwnerEmail: <strong>{ newOwnerEmail }</strong>,
			} ) }
		>
			{ __(
				'They will need to visit the link included in the email invitation for the site transfer to complete. The invitation will expire in 7 days.'
			) }
		</Notice>
	);
}
