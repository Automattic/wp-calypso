import { Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { intlFormat } from 'date-fns';
import Notice from '../../../components/notice';
import { classifyPurchaseForCopy, getProductNounForCategory } from './classify-purchase-for-copy';
import type { Purchase } from '@automattic/api-core';

/**
 * Transient success notice shown on Purchase Settings after a cancel.
 * Gated by the caller (on the `?cancelled=true` search param). Dismissible via
 * the built-in close button on the Notice component.
 */
export function PurchaseCancelledNotice( {
	purchase,
	onClose,
}: {
	purchase: Purchase;
	onClose: () => void;
} ) {
	// One-time purchases and edge cases without an expiry can't render a
	// meaningful "until <date>" message, so skip the notice entirely.
	if ( ! purchase.expiry_date ) {
		return null;
	}
	const expiryDate = intlFormat(
		new Date( purchase.expiry_date ),
		{ dateStyle: 'long' },
		{ locale: 'en-US' }
	);

	if ( purchase.will_atomic_revert_after_removal ) {
		const exportUrl = `https://${ purchase.domain }/wp-admin/export.php`;
		return (
			<Notice
				variant="success"
				onClose={ onClose }
				actions={
					<Button variant="primary" href={ exportUrl } target="_blank" rel="noreferrer">
						{ __( 'Download backup' ) }
					</Button>
				}
			>
				{ sprintf(
					/* translators: %(expiryDate)s is a date like "April 21, 2027". */
					__(
						'Your subscription is cancelled and you won\u2019t be billed again. Your site stays live until %(expiryDate)s. Download a backup to save your content, themes, and plugins.'
					),
					{ expiryDate }
				) }
			</Notice>
		);
	}

	const productNoun = getProductNounForCategory( classifyPurchaseForCopy( purchase ) );
	return (
		<Notice variant="success" onClose={ onClose }>
			{ sprintf(
				/* translators: %(productNoun)s is plan/domain/email/theme/plugin/subscription, %(expiryDate)s is a date like "April 21, 2027" */
				__(
					'Your subscription is cancelled and you won\u2019t be billed again. You\u2019ll continue to have access to the %(productNoun)s until %(expiryDate)s.'
				),
				{ productNoun, expiryDate }
			) }
		</Notice>
	);
}
