import {
	Button,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { Notice } from '../../../components/notice';

/**
 * A4AD-186 prototype. The banner Main shows on Referrals right after a
 * referral is created (client/a8c-for-agencies/sections/referrals/primary/
 * referrals-overview/new-referral-order-notification.tsx), copy included.
 * The checkout flow lands here with the client email, the flow and the link
 * in the URL, the way Main does it.
 */
export default function NewReferralNotice() {
	const params = new URLSearchParams( window.location.search );
	const email = params.get( 'referral_email' );
	const flow = params.get( 'referral_flow' );
	const link = params.get( 'referral_link' ) ?? '';
	const [ isOpen, setIsOpen ] = useState( Boolean( email ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	if ( ! email || ! isOpen ) {
		return null;
	}

	const copyLink = () => {
		navigator.clipboard
			.writeText( link )
			.then( () =>
				createSuccessNotice( __( 'Link has been copied to clipboard' ), { type: 'snackbar' } )
			)
			.catch( () =>
				createErrorNotice( __( "Couldn't copy link to clipboard" ), { type: 'snackbar' } )
			);
	};

	return (
		<Notice
			variant="success"
			title={
				flow === 'copy'
					? __( 'The referral link has been copied to your clipboard!' )
					: sprintf(
							/* translators: %s is the client's email address */
							__( 'Referral sent to %s' ),
							email
					  )
			}
			onClose={ () => setIsOpen( false ) }
			actions={
				<Button variant="secondary" __next40pxDefaultSize onClick={ copyLink }>
					{ __( 'Copy referral link' ) }
				</Button>
			}
		>
			<VStack spacing={ 1 }>
				<Text as="p">
					{ __(
						'This link is valid for 14 days. Please ensure your client makes this purchase before it expires.'
					) }
				</Text>
				<Text as="p">
					{ __(
						'During checkout, your client will create a WordPress.com account and will be emailed a receipt.'
					) }
				</Text>
				<Text as="p">
					{ __(
						'After purchase, you can immediately set up the hosting or any products referred.'
					) }
				</Text>
			</VStack>
		</Notice>
	);
}
