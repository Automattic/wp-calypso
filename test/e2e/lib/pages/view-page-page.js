/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import PaymentButtonFrontEndComponent from '../components/payment-button-front-end-component';

import * as driverHelper from '../driver-helper.js';

export default class ViewPagePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.type-page' ) );
	}

	async pageTitle() {
		return await this.driver.findElement( By.css( '.entry-title,.post-title' ) ).getText();
	}

	async pageContent() {
		return await this.driver.findElement( By.css( '.entry-content,.post-content' ) ).getText();
	}

	async sharingButtonsVisible() {
		return await driverHelper.isElementPresent( this.driver, By.css( 'div.sd-sharing' ) );
	}

	async isPasswordProtected() {
		return await driverHelper.isElementPresent( this.driver, By.css( 'form.post-password-form' ) );
	}

	async categoryDisplayed() {
		return await this.driver
			.findElement(
				By.css( 'span.cat-links a[rel="category tag"],.post-categories a[rel="category tag"]' )
			)
			.getText();
	}

	async tagDisplayed() {
		return await this.driver
			.findElement( By.css( '.tag-links a[rel=tag],.tags-links a[rel=tag],.post-tags a[rel=tag]' ) )
			.getText();
	}

	async enterPassword( password ) {
		await this.driver
			.findElement( By.css( 'form.post-password-form input[name=post_password]' ) )
			.sendKeys( password );
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'form.post-password-form input[name=Submit]' )
		);
	}

	async imageDisplayed( fileDetails ) {
		const imageElement = await this.driver.findElement(
			By.css( `img[alt='${ fileDetails.imageName }']` )
		);
		return await driverHelper.imageVisible( this.driver, imageElement );
	}

	async paymentButtonDisplayed() {
		let paymentButtonFrontEndComponent;
		try {
			paymentButtonFrontEndComponent = await PaymentButtonFrontEndComponent.Expect( this.driver );
		} catch ( e ) {
			this.driver.navigate().refresh();
			paymentButtonFrontEndComponent = await PaymentButtonFrontEndComponent.Expect( this.driver );
		}

		return await paymentButtonFrontEndComponent.displayed();
	}

	async clickPaymentButton() {
		const paymentButtonFrontEndComponent = await PaymentButtonFrontEndComponent.Expect(
			this.driver
		);
		return await paymentButtonFrontEndComponent.clickPaymentButton();
	}
}
