/**
 * Constants for tagging post-checkout redirect URLs with a marker that tells
 * the destination page to dispatch a success toast on arrival.
 *
 * Sources:
 * - `checkout-thank-you/pending/index.tsx` appends `?<KEY>=<VALUE>` to the
 *   redirect URL when the receipt matches a known purchase shape.
 * - The destination (e.g. `customer-home/main.tsx`) reads the param, dispatches
 *   the toast, and strips the param via `history.replaceState`.
 *
 * Kept in its own module so that destinations can pull in the constants
 * without transitively importing the pending page's heavy dependency graph
 * (page.js, shopping-cart hooks, calypso-products, etc.) — which can break
 * unrelated unit-test environments.
 */
export const PURCHASE_NOTICE_QUERY_KEY = 'notice';
export const PLAN_AND_DOMAIN_NOTICE_QUERY_VALUE = 'plan-and-domain';
// Set by `get-thank-you-page-url` on signup destinations; the editor reads it too.
export const PURCHASE_SUCCESS_NOTICE_QUERY_VALUE = 'purchase-success';
