import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container';

export default class DesignLocatorPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.designs' ) );
		this.freeOptionLocator = By.css( 'button[data-e2e-button="freeOption"]' );
		this.paidOptionLocator = By.css( 'button[data-e2e-button="paidOption"]' );
	}

	async selectFreeDesign() {
		const freeOptions = await this.driver.findElements( this.freeOptionLocator );
		if ( freeOptions.length <= 1 ) {
			throw new Error(
				'There should be more than one free design found on the design selection page'
			);
		}

		const firstNonBlankDesign = freeOptions[ 1 ];
		await firstNonBlankDesign.click();
	}
}
