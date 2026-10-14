import { __, sprintf } from '@wordpress/i18n';
import Notice from '../../../components/notice';
import { getSubtitleForDisplay } from '../../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

/**
 * Tells the customer that a partner provisioned and bills this subscription, so
 * changes have to go through the partner. It carries the whole explanation for
 * why the page has no management actions, which is why it's a notice rather than
 * a line of sub-header metadata.
 *
 * The caller gates this on `purchase.is_partner_managed`.
 */
export function PartnerManagedNotice( { purchase }: { purchase: Purchase } ) {
	const subtitle = getSubtitleForDisplay( purchase );
	if ( ! subtitle || ! purchase.partner_name ) {
		return null;
	}

	return (
		<Notice variant="info">
			{ sprintf(
				/* translators: %(subtitle)s is the type of purchase (e.g. "Host Managed Plan"), %(partnerName)s is the name of the business partner */
				__( '%(subtitle)s. Please contact %(partnerName)s for details.' ),
				{ subtitle, partnerName: purchase.partner_name }
			) }
		</Notice>
	);
}
