/**
 * The checkout pending page replaces `:receiptId` with the real receipt ID, but
 * only when the transaction succeeds — failed or cancelled payments are sent
 * back to checkout instead. This makes `receipt_id` on the licenses page a
 * reliable "successful purchase" signal used to clear the persisted mini-cart.
 */
export const RECEIPT_ID_PLACEHOLDER = ':receiptId';

export default function getSuccessRedirectUrl(
	origin: string,
	shouldClearCartOnSuccess: boolean
): string {
	const url = `${ origin }/purchases/licenses`;

	return shouldClearCartOnSuccess ? `${ url }?receipt_id=${ RECEIPT_ID_PLACEHOLDER }` : url;
}
