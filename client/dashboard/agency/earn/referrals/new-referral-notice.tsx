import { useNavigate } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { customLink } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useAnalytics } from '../../../app/analytics';
import { earnReferralsRoute } from '../../../app/router/agency';
import { Notice } from '../../../components/notice';

/**
 * Confirms the payment request the referral checkout just sent, with the link
 * the client got, so it can be copied again. The checkout returns here with the
 * request in the URL; closing the notice drops it.
 */
export default function NewReferralNotice() {
	const { new_referral_order_email, new_referral_order_checkout_url, flow_type } =
		earnReferralsRoute.useSearch();
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	if ( ! new_referral_order_email || ! new_referral_order_checkout_url ) {
		return null;
	}

	const checkoutUrl = new_referral_order_checkout_url;
	const isSent = flow_type !== 'copy';

	const onClose = () =>
		navigate( {
			to: '/earn/referrals',
			search: {},
			replace: true,
		} );

	const onCopyLink = () => {
		recordTracksEvent( 'calypso_a4a_referrals_notification_copy_link_button_click' );
		navigator.clipboard.writeText( checkoutUrl ).then(
			() => createSuccessNotice( __( 'Link has been copied to clipboard' ), { type: 'snackbar' } ),
			() => createErrorNotice( __( 'Couldn’t copy link to clipboard' ), { type: 'snackbar' } )
		);
	};

	return (
		<Notice
			variant="success"
			title={
				isSent
					? sprintf(
							/* translators: %s is the client's email address. */
							__( 'Referral sent to %s' ),
							new_referral_order_email
						)
					: __( 'The referral link has been copied to your clipboard!' )
			}
			onClose={ onClose }
			actions={
				<Button variant="secondary" icon={ customLink } onClick={ onCopyLink }>
					{ isSent ? __( 'Copy link' ) : __( 'Copy link again' ) }
				</Button>
			}
		>
			<ul>
				<li>
					{ createInterpolateElement(
						__(
							'This link is <b>valid for 14 days</b>. Please ensure your client makes this purchase before it expires.'
						),
						{ b: <b /> }
					) }
				</li>
				<li>
					{ __(
						'During checkout, your client will create a WordPress.com account and will be emailed a receipt.'
					) }
				</li>
				<li>
					{ __(
						'After purchase, you can immediately set up the hosting or any products referred.'
					) }
				</li>
			</ul>
		</Notice>
	);
}
