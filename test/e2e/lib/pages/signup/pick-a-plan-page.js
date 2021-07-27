import config from 'config';
import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container';
import { getJetpackHost } from '../../data-helper.js';
import * as driverHelper from '../../driver-helper.js';
import * as driverManager from '../../driver-manager';

export default class PickAPlanPage extends AsyncBaseContainer {
	constructor( driver ) {
		const host = getJetpackHost();
		const plansCssHandle = host !== 'WPCOM' ? '.selector__main' : '.plans-features-main__group';
		super( driver, By.css( plansCssHandle ), null, config.get( 'explicitWaitMS' ) * 2 );
		this.host = host;
	}

	async selectFreePlan() {
		return await this._selectPlan( 'free' );
	}

	// Explicitly select the free button on jetpack without needing `host` above.
	async selectFreePlanJetpack() {
		const freePlanButton = By.css( '[data-e2e-product-slug="free"] a' );
		await driverHelper.scrollIntoView( this.driver, freePlanButton );
		return await driverHelper.clickWhenClickable( this.driver, freePlanButton );
	}

	async selectPremiumPlan() {
		return await this._selectPlan( 'premium' );
	}

	async _selectPlan( level ) {
		const planLocator = `.button.is-${ level }-plan`;

		const locator = By.css( planLocator );

		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, locator );

		await this.scrollPlanInToView( level );

		await driverHelper.clickWhenClickable( this.driver, locator );
		try {
			await driverHelper.waitUntilElementNotLocated( this.driver, locator );
		} catch {
			//If the first click doesn't take, try again
			await driverHelper.clickWhenClickable( this.driver, locator );
		}
	}

	async scrollPlanInToView( level ) {
		// Defaults to showing business plan first, so we need to move to correct plan
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			switch ( level ) {
				case 'business':
					await this.clickDirectionArrow( 'right' );
					break;
				case 'personal':
					await this.clickDirectionArrow( 'left' );
					await this.clickDirectionArrow( 'left' );
					break;
				case 'ecommerce':
					await this.clickDirectionArrow( 'right' );
					await this.clickDirectionArrow( 'right' );
					break;
				default:
					break;
			}
		}
	}

	async clickDirectionArrow( direction ) {
		const arrowLocator = By.css( `.plan-features__scroll-${ direction } button` );
		return await driverHelper.clickWhenClickable( this.driver, arrowLocator );
	}
}
