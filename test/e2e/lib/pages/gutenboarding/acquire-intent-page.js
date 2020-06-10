/**
 * External dependencies
 */
import { By, Key } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class AcquireIntentPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.acquire-intent' ) );
	}

	async enterVertical( verticalLabel ) {
		const verticalWrapperSelector = By.css( '.vertical-select__input-wrapper' );
		await driverHelper.clickWhenClickable( this.driver, verticalWrapperSelector );

		const verticalSelector = By.css( '.vertical-select .madlib__input' );
		await driverHelper.waitTillFocused( this.driver, verticalSelector );

		const verticalElement = this.driver.findElement( verticalSelector );
		await verticalElement.sendKeys( verticalLabel );
		return await verticalElement.sendKeys( Key.ENTER );
	}

	async enterSiteTitle( siteTitle ) {
		const siteTitleSelector = By.css( '.site-title .madlib__input' );
		const siteTitleElement = this.driver.findElement( siteTitleSelector );
		return await siteTitleElement.sendKeys( siteTitle );
	}

	async goToNextStep() {
		const nextButtonSelector = By.css( '.acquire-intent__next-button' );
		return await driverHelper.clickWhenClickable( this.driver, nextButtonSelector );
	}
}
