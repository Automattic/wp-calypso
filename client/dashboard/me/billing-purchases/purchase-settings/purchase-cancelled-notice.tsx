import { Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { intlFormat } from 'date-fns';
import Notice from '../../../components/notice';
import { classifyPurchaseForCopy } from './classify-purchase-for-copy';
import type { Purchase } from '@automattic/api-core';

/**
 * Plain-English noun for a purchase ("plan" / "domain" / "email" / "theme" /
 * "plugin" / "subscription"). Used by the cancelled success notice and by the
 * remove-success snackbar.
 */
export function getProductNoun( purchase: Purchase ): string {
	switch ( classifyPurchaseForCopy( purchase ) ) {
		case 'plan':
			return __( 'plan' );
		case 'domain':
			return __( 'domain' );
		case 'email':
			return __( 'email' );
		case 'marketplace_theme':
			return __( 'theme' );
		case 'marketplace_plugin':
			return __( 'plugin' );
		default:
			return __( 'subscription' );
	}
}

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

	const productNoun = getProductNoun( purchase );
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
