import { createValueStore } from './value-store';
import type { VatDetails } from '@automattic/wpcom-checkout';

/**
 * The VAT details being edited in the checkout form, which may differ from
 * the VAT details saved on the server until the contact step is completed.
 */
export const vatDetailsInFormStore = createValueStore< VatDetails >( {} );

/**
 * The client ID of the Google reCAPTCHA widget used when creating an account
 * during a logged-out checkout.
 */
export const recaptchaClientIdStore = createValueStore< number >( -1 );

export function resetCheckoutStores(): void {
	vatDetailsInFormStore.reset();
	recaptchaClientIdStore.reset();
}
