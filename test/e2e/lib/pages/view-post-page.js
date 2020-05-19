/**
 * External dependencies
 */
import assert from 'assert';
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper';
import PaymentButtonFrontEndComponent from '../components/payment-button-front-end-component';

export default class ViewPostPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.type-post' ) );
	}

	async postTitle() {
		return await this.driver.findElement( By.css( '.entry-title,.post-title' ) ).getText();
	}

	async commentsVisible() {
		return await driverHelper.isElementPresent( this.driver, By.css( '#respond' ) );
	}

	async sharingButtonsVisible() {
		return await driverHelper.isElementPresent( this.driver, By.css( 'div.sd-sharing' ) );
	}

	async postContent() {
		return await this.driver.findElement( By.css( '.entry-content,.post-content' ) ).getText();
	}

	async categoryDisplayed() {
		return await this.driver
			.findElement( By.css( 'a[rel="category tag"], a[rel="category"]' ) )
			.getText();
	}

	async tagDisplayed() {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( 'a[rel=tag]' ) );
		return await this.driver.findElement( By.css( 'a[rel=tag]' ) ).getText();
	}

	async contactFormDisplayed() {
		return await driverHelper.isElementPresent( this.driver, By.css( '.contact-form' ) );
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

	async isPasswordProtected() {
		return await driverHelper.isElementPresent( this.driver, By.css( 'form.post-password-form' ) );
	}

	async enterPassword( password ) {
		const element = await this.driver.findElement(
			By.css( 'form.post-password-form input[name=post_password]' )
		);
		await element.sendKeys( password );
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'form.post-password-form input[name=Submit]' ),
			this.explicitWaitMS
		);
	}

	async imageDisplayed( fileDetails ) {
		return await this.driver
			.findElement( By.css( `img[alt='${ fileDetails.imageName }']` ) )
			.then( ( imageElement ) => {
				return driverHelper.imageVisible( this.driver, imageElement );
			} );
	}

	async leaveAComment( comment ) {
		const commentButtonSelector = By.css( '#comment-submit' );
		const commentSubmittingSelector = By.css( '#comment-form-submitting' );
		await driverHelper.setWhenSettable( this.driver, By.css( '#comment' ), comment );
		await driverHelper.clickWhenClickable( this.driver, commentButtonSelector );
		return await driverHelper.waitTillNotPresent( this.driver, commentSubmittingSelector );
	}

	async commentEventuallyShown( comment ) {
		const commentSelector = By.xpath( `//p[text() = "${ comment }"]` );
		return await driverHelper.isEventuallyPresentAndDisplayed( this.driver, commentSelector );
	}

	async embedContentDisplayed( selector ) {
		const element = By.css( `${ selector }` );
		const displayed = await driverHelper.isEventuallyPresentAndDisplayed( this.driver, element );
		return assert.strictEqual(
			displayed,
			true,
			`The published post does not contain ${ selector } element`
		);
	}
}
