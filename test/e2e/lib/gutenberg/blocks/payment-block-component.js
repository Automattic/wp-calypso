/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import GutenbergBlockComponent from './gutenberg-block-component';

export default class SimplePaymentsBlockComponent extends GutenbergBlockComponent {
	async insertPaymentButtonDetails( {
		title = 'Button',
		description = 'Description',
		price = '1.00',
		currency = 'AUD',
		allowQuantity = true,
		email = 'test@wordpress.com',
	} = {} ) {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.wp-block-jetpack-simple-payments' )
		);
		await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.simple-payments__field-title .components-text-control__input' ),
			title
		);
		await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.simple-payments__field-content .components-textarea-control__input' ),
			description
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css(
				`.simple-payments__field-currency .components-select-control__input option[value="${ currency }"]`
			)
		);
		await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.simple-payments__field-price .components-text-control__input' ),
			price
		);
		if ( allowQuantity === true ) {
			await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.simple-payments__field-multiple .components-form-toggle__input' )
			);
		}
		return await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.simple-payments__field-email .components-text-control__input' ),
			email
		);
	}

	async ensurePaymentButtonDisplayedInEditor() {
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.jetpack-simple-payments-button' )
		);
	}
}
