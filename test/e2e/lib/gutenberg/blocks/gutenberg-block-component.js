import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class GutenbergBlockComponent extends AsyncBaseContainer {
	constructor( driver, blockID ) {
		// Not smart enough :shrug:
		super( driver, By.css( `#${ blockID }` ) );
		this.blockID = `#${ blockID }`;
	}

	static async Expect( driver, blockID ) {
		const page = new this( driver, blockID );
		await page._expectInit();
		return page;
	}

	async focusBlock() {
		const selectedBlockLocator = By.css(
			`${ this.blockID }.block-editor-block-list__block.is-selected`
		);

		await driverHelper.clickWhenClickable( this.driver, this.expectedElementLocator );
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			selectedBlockLocator
		);
	}
}
