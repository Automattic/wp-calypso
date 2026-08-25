import {
	A4A_LICENSES_LINK,
	A4A_SITES_LINK_NEEDS_SETUP,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';

/**
 * The checkout pending page replaces `:receiptId` with the real receipt ID, but
 * only when the transaction succeeds — failed or cancelled payments are sent
 * back to checkout instead. This makes `receipt_id` on the landing page a
 * reliable "successful purchase" signal used to clear the persisted mini-cart.
 */
export const RECEIPT_ID_PLACEHOLDER = ':receiptId';

export default function getSuccessRedirectUrl(
	origin: string,
	shouldClearCartOnSuccess: boolean,
	wpcomPlanSlug?: string | null
): string {
	const url = `${ origin }${ wpcomPlanSlug ? A4A_SITES_LINK_NEEDS_SETUP : A4A_LICENSES_LINK }`;

	const queryArgs = [
		...( wpcomPlanSlug
			? [ `wpcom_creator_purchased=${ encodeURIComponent( wpcomPlanSlug ) }` ]
			: [] ),
		// Built by hand rather than with `addQueryArgs`, which would percent-encode
		// the colon the pending page looks for when interpolating the receipt ID.
		...( shouldClearCartOnSuccess ? [ `receipt_id=${ RECEIPT_ID_PLACEHOLDER }` ] : [] ),
	];

	return queryArgs.length ? `${ url }?${ queryArgs.join( '&' ) }` : url;
}
