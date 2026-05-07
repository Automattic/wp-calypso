/**
 * Utilities for reading data from retired stored payment methods.
 *
 * After wpcom replaces a partner-specific Stored_Payment_* class with the
 * generic Retired_Stored_Payment_Method, the JSON shape changes: partner-
 * specific top-level fields (e.g. `razorpay_vpa`) move into a uniform
 * `display_meta` envelope. These helpers read partner-specific data from
 * either shape (live row's typed property, or retired row's `display_meta`
 * entry) so display sites render historic rows uniformly across the
 * deploy window between the prep PR and the engine-deletion PR.
 *
 * Helpers here take structural parameter types rather than the
 * `StoredPaymentMethod` union so they're callable from any consumer
 * regardless of which package's union type they happen to use.
 *
 * Per-retirement PRs add additional helpers here as needed.
 */

interface RazorpayVpaSource {
	payment_partner: string;
	razorpay_vpa?: string;
	retired?: boolean;
	display_meta?: Record< string, string >;
}

/**
 * Extract the Razorpay VPA from a stored payment method, handling both:
 * - Live rows hydrated by Stored_Payment_Razorpay (top-level `razorpay_vpa`)
 * - Retired rows hydrated by Retired_Stored_Payment_Method
 *   (`display_meta.razorpay_vpa`)
 *
 * Returns undefined for non-Razorpay rows or rows with no VPA recorded.
 *
 * Relies on the convention that `display_meta` keys are partner-prefixed
 * (`razorpay_vpa`, never bare `vpa`), so a `display_meta.razorpay_vpa`
 * presence unambiguously identifies a retired Razorpay row.
 */
export function getRazorpayVpa( method: RazorpayVpaSource ): string | undefined {
	if ( method.retired ) {
		return method.display_meta?.razorpay_vpa;
	}
	return method.razorpay_vpa;
}
