/**
 * External dependencies
 */
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
		return await driverHelper.isElementLocated( this.driver, By.css( '#respond' ) );
	}

	async sharingButtonsVisible() {
		return await driverHelper.isElementLocated( this.driver, By.css( 'div.sd-sharing' ) );
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
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, By.css( 'a[rel=tag]' ) );
		return await this.driver.findElement( By.css( 'a[rel=tag]' ) ).getText();
	}

	async contactFormDisplayed() {
		return await driverHelper.isElementLocated( this.driver, By.css( '.contact-form' ) );
	}

	async paymentButtonDisplayed( retries = 3 ) {
		if ( retries <= 0 ) return false;
		let paymentButtonFrontEndComponent;
		try {
			paymentButtonFrontEndComponent = await PaymentButtonFrontEndComponent.Expect( this.driver );
			return await paymentButtonFrontEndComponent.displayed();
		} catch ( e ) {
			await this.driver.navigate().refresh();
			return await this.paymentButtonDisplayed( retries-- );
		}
	}

	async clickPaymentButton() {
		const paymentButtonFrontEndComponent = await PaymentButtonFrontEndComponent.Expect(
			this.driver
		);
		return await paymentButtonFrontEndComponent.clickPaymentButton();
	}

	async isPasswordProtected() {
		return await driverHelper.isElementLocated( this.driver, By.css( 'form.post-password-form' ) );
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

	async imageDisplayed( { imageName } ) {
		const imageLocator = By.css( `img[alt='${ imageName }']` );
		return await driverHelper.isImageVisible( this.driver, imageLocator );
	}

	async leaveAComment( comment ) {
		const commentButtonLocator = By.css( '#comment-submit' );
		const commentSubmittingLocator = By.css( '#comment-form-submitting' );
		await driverHelper.setWhenSettable( this.driver, By.css( '#comment' ), comment );
		await driverHelper.clickWhenClickable( this.driver, commentButtonLocator );
		return await driverHelper.waitUntilElementNotLocated( this.driver, commentSubmittingLocator );
	}

	async commentEventuallyShown( comment ) {
		const commentLocator = By.xpath( `//p[text() = "${ comment }"]` );
		return await driverHelper.isElementEventuallyLocatedAndVisible( this.driver, commentLocator );
	}

	async isEmbedDisplayed( name ) {
		const selector = {
			YouTube: '.youtube-player',
			Instagram: '.instagram-media-rendered',
			Twitter: '.twitter-tweet-rendered',
		}[ name ];

		return await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			By.css( selector )
		);
	}
}
