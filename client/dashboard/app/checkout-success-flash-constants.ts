/**
 * Query params the checkout pending page adds to a successful redirect back
 * into the Dashboard, read by `<CheckoutSuccessFlashMessage>` in the app shell.
 * Kept free of imports so the checkout bundle doesn't pull in Dashboard code.
 */
export const CHECKOUT_SUCCESS_FLASH_ID = 'checkout-success';

/**
 * Set alongside the flash id when the order included a new plan, so the toast
 * can name the plan that is now active.
 */
export const CHECKOUT_SUCCESS_PLAN_SITE_ID_PARAM = 'plan_site_id';
