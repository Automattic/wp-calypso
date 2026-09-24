/**
 * The set of UI variants the cancel/confirmation screens can render, chosen
 * from the entry point the user came from:
 * `cancel`      = clicked "Cancel subscription" on Purchase Settings.
 * `remove`      = clicked "Remove subscription / Remove {product}" on Purchase Settings.
 * `auto-renew`  = toggled off auto-renew on Purchase Settings.
 */
export type DisplayVariant = 'cancel' | 'remove' | 'auto-renew';
