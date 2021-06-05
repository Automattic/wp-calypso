/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

const selectors = {
	// Page-wide selectors
	main: '.composite-checkout',
	loadingIndicator: 'text=Loading checkout',
	checkoutSteps: '.checkout__step-wrapper',
	closeButton: '.masterbar__secure-checkout .masterbar__close-button',

	// Contact Information
	editContactInformationButton: 'button[aria-label="Edit the contact details"]',
	contactInformationFields: '.contact-details-form-fields',
	firstName: '#first-name',
	lastName: '#last-name',
	email: '#email',
	phoneCountryOption: '.phone-input__country-select',
	phoneNumber: 'input[name="phone"]',
	countryOption: 'select[name=country-code]',
	addressPrimary: '#address-1',
	city: '#city',
	state: 'select[name=state]',
	postalCode: '#postal-code',

	// Payment
	paymentMethodsList: '.checkout-payment-methods',
};

/**
 * Page representing the Checkout page and its various sections.
 *
 * @augments {BaseContainer}
 */
export class CheckoutPage extends BaseContainer {
	constructor( page: Page ) {
		super( page, selectors.main );
	}

	async _postInit(): Promise< void > {
		await this.page.waitForSelector( selectors.loadingIndicator, { state: 'hidden' } );
		await this.page.waitForSelector( selectors.checkoutSteps );
		await this.page.waitForLoadState( 'networkidle' );
	}

	async close(): Promise< void > {
		await this.page.click( selectors.closeButton );
		await this.page.waitForNavigation();
	}

	async enterRegistrarDetails( details: {
		firstName: string;
		lastName: string;
		emailAddress: string;
		phoneNumber: string;
		countryCode: string;
		address: string;
		city: string;
		stateCode: string;
		postalCode: string;
	} ): Promise< void > {
		await this.page.click( selectors.editContactInformationButton );

		const fields = await this.page.waitForSelector( selectors.contactInformationFields, {
			state: 'visible',
		} );
		await fields.waitForElementState( 'stable' );

		await this.populateContactInformationFields( details );

		await this.page.click( 'text=Continue' );
		await this.page.waitForSelector( selectors.contactInformationFields, { state: 'hidden' } );
	}

	async populateContactInformationFields( details: {
		firstName: string;
		lastName: string;
		emailAddress: string;
		phoneNumber: string;
		countryCode: string;
		address: string;
		city: string;
		stateCode: string;
		postalCode: string;
	} ): Promise< void > {
		await this.fillField( selectors.firstName, details.firstName );
		await this.fillField( selectors.lastName, details.lastName );
		await this.fillField( selectors.email, details.emailAddress );
		await this.page.selectOption( selectors.phoneCountryOption, details.countryCode );
		await this.page.selectOption( selectors.countryOption, details.countryCode );
		await this.fillField( selectors.phoneNumber, details.phoneNumber );
		await this.fillField( selectors.addressPrimary, details.address );
		await this.fillField( selectors.city, details.city );
		await this.page.selectOption( selectors.state, details.stateCode );
		await this.fillField( selectors.postalCode, details.postalCode );
	}

	async fillField( selector: string, text: string ): Promise< void > {
		const field = await this.page.waitForSelector( selector, { state: 'attached' } );
		await field.waitForElementState( 'stable' );
		await this.page.fill( selector, '' );
		await this.page.fill( selector, text );
	}

	async viewPaymentMethods(): Promise< void > {
		await this.page.waitForSelector( selectors.paymentMethodsList );
	}
}
