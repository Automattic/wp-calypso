/**
 * Query params the checkout pending page adds to a successful redirect, read by
 * `<CheckoutSuccessFlashMessage>` in the Dashboard app shell and by classic My
 * Home. Kept free of imports so the checkout bundle doesn't pull in Dashboard code.
 */
export const CHECKOUT_SUCCESS_FLASH_ID = 'checkout-success';

/**
 * Product slug of the plan bought in that order, if any.
 */
export const CHECKOUT_SUCCESS_PLAN_PARAM = 'purchased_plan';
