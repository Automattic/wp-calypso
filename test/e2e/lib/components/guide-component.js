import { By, Key } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class GuideComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.components-guide' ) );
	}

	async dismiss( waitOverride, selector = '.components-guide' ) {
		// There are two versions of the guide.  Firse we check for the modal version.
		if (
			await driverHelper.isElementEventuallyLocatedAndVisible(
				this.driver,
				By.css( '.components-guide__container' ),
				waitOverride
			)
		) {
			try {
				// Easiest way to dismiss it, but it might not work in IE.
				await this.driver.findElement( By.css( selector ) ).sendKeys( Key.ESCAPE );
			} catch {
				// Click to the last page of the welcome guide.
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css( 'ul.components-guide__page-control li:last-child button' )
				);
				// Click the finish button.
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css( '.components-guide__finish-button' )
				);
			}
		}
		// We must also check for the card based version of the welcome guide.
		if (
			await driverHelper.isElementEventuallyLocatedAndVisible(
				this.driver,
				By.css( '.wpcom-editor-welcome-tour-frame' ),
				waitOverride
			)
		) {
			const skipButtonLocator = driverHelper.createTextLocator(
				By.css( '.wpcom-editor-welcome-tour-frame button' ),
				'Skip'
			);
			await driverHelper.clickWhenClickable( this.driver, skipButtonLocator );
		}
	}
}
