import { RECEIPT_ID_PLACEHOLDER } from './get-success-redirect-url';

/**
 * Pressable endpoint that resumes its Titan email flow after an A4A purchase.
 */
export const PRESSABLE_TITAN_CHECKOUT_RETURN_URL =
	'https://my.pressable.com/titan_email/checkout_return';

/**
 * Where a buyer who arrived from Pressable's Titan email flow goes after paying.
 *
 * The checkout pending page swaps `:receiptId` for the real receipt ID only when
 * the transaction succeeds, so Pressable never receives a return without one.
 * Every other parameter Pressable expects is appended here as it is added.
 *
 * Built by hand rather than with `addQueryArgs`, which would percent-encode the
 * colon the pending page looks for when interpolating the receipt ID.
 */
export default function getPressableTitanReturnUrl(): string {
	return `${ PRESSABLE_TITAN_CHECKOUT_RETURN_URL }?receipt_id=${ RECEIPT_ID_PLACEHOLDER }`;
}
