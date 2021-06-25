/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper.js';
import AsyncBaseContainer from '../../async-base-container';

export default class PlansPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.features' ) );
	}

	async skipStep() {
		const skipButtonLocator = By.css( '.action-buttons__skip' );
		return await driverHelper.clickWhenClickable( this.driver, skipButtonLocator );
	}

	async goToNextStep() {
		const nextButtonLocator = By.css( '.action-buttons__next' );
		return await driverHelper.clickWhenClickable( this.driver, nextButtonLocator );
	}

	async selectPluginsFeature() {
		const pluginsFeatureButon = By.css( 'button[data-e2e-button="feature-plugins"]' );
		return await driverHelper.clickIfPresent( this.driver, pluginsFeatureButon );
	}
}
