import page from '@automattic/calypso-router';
import { removeQueryArgs } from '@wordpress/url';
import { clearPersistedSelectedItems } from './shopping-cart-storage';
import type { Context } from '@automattic/calypso-router';

/**
 * Arriving with a receipt ID means the marketplace checkout just completed
 * successfully (failed or cancelled payments never redirect here), so the
 * purchased items can be removed from the persisted mini-cart.
 *
 * The marker is single-use: `receipt_id` is stripped from the URL with a
 * history replace (no reload, no re-dispatch) so reloading or bookmarking the
 * landing URL cannot clear a future cart.
 */
export default function consumeCheckoutReceiptMarker( context: Context ): void {
	if ( ! context.query.receipt_id ) {
		return;
	}

	clearPersistedSelectedItems( 'regular' );
	page.replace( removeQueryArgs( context.canonicalPath, 'receipt_id' ), null, false, false );
}
