/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class DomainsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.domains' ) );
	}

	async clickFreeSuggestionItem() {
		const freeSuggestionItemSelector = By.css( '.domain-picker__suggestion-item.is-free' );
		return await driverHelper.clickWhenClickable( this.driver, freeSuggestionItemSelector );
	}
}
