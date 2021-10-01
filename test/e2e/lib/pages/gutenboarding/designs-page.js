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
		if ( freeOptions.length === 0 ) {
			throw new Error( 'No free designs were found on design selection page' );
		}

		const blankCanvasIndex = 0;
		const firstNonBlankIndex = 1;
		// If possible, we should skip first design, which is the blank canvas, and pick the first other one.
		const selectedDesignIndex = freeOptions.length > 1 ? firstNonBlankIndex : blankCanvasIndex;
		await freeOptions[ selectedDesignIndex ].click();
	}
}
