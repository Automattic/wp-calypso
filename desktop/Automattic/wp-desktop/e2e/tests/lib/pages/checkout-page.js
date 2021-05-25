/* eslint-disable jsdoc/check-tag-names */
/** @format */

const { By } = require( 'selenium-webdriver' );
const AsyncBaseContainer = require( '../async-base-container' );
const driverHelper = require( '../driver-helper' );

class CheckoutPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.layout__content' ) );
	}

	async isShoppingCartPresent() {
		// temp try/catch block
		// while A/B test for composite checkout is on
		try {
			await driverHelper.waitTillPresentAndDisplayed(
				this.driver,
				By.css( '.composite-checkout' ),
				this.explicitWaitMS * 2
			);
			// await driverHelper.waitTillPresentAndDisplayed(
			// 	this.driver,
			// 	By.css( '.checkout__payment-methods-step' )
			// );
		} catch ( e ) {
			console.log( 'Composite checkout is not displayed. Trying with regular checkout...' ); // eslint-disable-line no-console
			await driverHelper.waitTillPresentAndDisplayed(
				this.driver,
				By.css( '.payment-box__content' )
			);
			await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.cart-item' ) );
		}
	}

	async emptyShoppingCart() {
		await driverHelper.clickWhenClickable( this.driver, By.css( '.gridicons-trash' ) );
		await driverHelper.waitTillNotPresent( this.driver, By.css( '.payment-box__content' ) );
		return await driverHelper.isEventuallyPresentAndDisplayed( this.driver, By.css( '#plans' ) );
	}
}

module.exports = CheckoutPage;
