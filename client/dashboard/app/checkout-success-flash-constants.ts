/**
 * Query params the checkout pending page adds to a successful redirect back
 * into the Dashboard, read by `<CheckoutSuccessFlashMessage>` in the app shell.
 * Kept free of imports so the checkout bundle doesn't pull in Dashboard code.
 */
export const CHECKOUT_SUCCESS_FLASH_ID = 'checkout-success';

/**
 * Product slug of the plan bought in that order, if any, so the toast can name
 * the plan that is now active.
 */
export const CHECKOUT_SUCCESS_PLAN_PARAM = 'purchased_plan';
