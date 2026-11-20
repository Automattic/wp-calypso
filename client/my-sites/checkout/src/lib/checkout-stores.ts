import {
	emptyManagedContactDetails,
	managedContactDetailsUpdaters as updaters,
} from '../types/wpcom-store-state';
import { createValueStore, useValueStore } from './value-store';
import type { DomainContactDetails } from '@automattic/shopping-cart';
import type {
	ManagedContactDetails,
	ManagedContactDetailsErrors,
	PossiblyCompleteDomainContactDetails,
	SitelessCheckoutType,
	VatDetails,
} from '@automattic/wpcom-checkout';

/**
 * The contact details entered in the checkout form.
 */
export const contactDetailsStore = createValueStore< ManagedContactDetails >(
	emptyManagedContactDetails
);

export function useContactDetails(): ManagedContactDetails {
	return useValueStore( contactDetailsStore );
}

function updateContactDetails(
	updater: ( details: ManagedContactDetails ) => ManagedContactDetails
): void {
	contactDetailsStore.set( updater( contactDetailsStore.get() ) );
}

export const contactDetailsActions = {
	updateTaxFields: ( newDetails: ManagedContactDetails ) =>
		updateContactDetails( ( details ) => updaters.updateTaxFields( details, newDetails ) ),

	updateDomainContactFields: ( newDetails: DomainContactDetails ) =>
		updateContactDetails( ( details ) =>
			updaters.updateDomainContactFields( details, newDetails )
		),

	updateEmail: ( email: string ) =>
		updateContactDetails( ( details ) => updaters.updateEmail( details, email ) ),

	touchContactFields: () => updateContactDetails( updaters.touchContactFields ),

	applyDomainContactValidationResults: ( errors: ManagedContactDetailsErrors ) =>
		updateContactDetails( ( details ) => updaters.setErrorMessages( details, errors ) ),

	clearDomainContactErrorMessages: () => updateContactDetails( updaters.clearErrorMessages ),

	loadCountryCodeFromGeoIP: ( countryCode: string ) =>
		updateContactDetails( ( details ) =>
			updaters.populateCountryCodeFromGeoIP( details, countryCode )
		),

	loadDomainContactDetailsFromCache: ( cachedDetails: PossiblyCompleteDomainContactDetails ) =>
		updateContactDetails( ( details ) =>
			updaters.populateDomainFieldsFromCache( details, cachedDetails )
		),
};

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

/**
 * What the cart says about a renewal by subscription ID alone, whose URL does
 * not say which kind of purchase it is. `null` until the cart has loaded, so
 * the checkout header can wait for it rather than show the wrong brand. A
 * renewal on a site is `{ sitelessCheckoutType: undefined }`.
 */
export const resolvedRenewalDataStore = createValueStore< {
	sitelessCheckoutType: SitelessCheckoutType;
} | null >( null );

export function resetCheckoutStores(): void {
	contactDetailsStore.reset();
	vatDetailsInFormStore.reset();
	recaptchaClientIdStore.reset();
	resolvedRenewalDataStore.reset();
}
