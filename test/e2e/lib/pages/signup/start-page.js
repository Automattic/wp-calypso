/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as dataHelper from '../../data-helper';
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class StartPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		const logInURL = dataHelper.getCalypsoURL( 'log-in' ); // we use the log-in page to set the AB test control groups on visit
		super( driver, By.css( '#wpcom' ), logInURL );
		this.startURL = url;
	}

	async _postInit() {
		if ( this.visiting ) {
			await this.setABTestControlGroupsInLocalStorage();
			await this.driver.get( this.startURL ); // this is the actual calculated start URL
		}
		return await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.step-wrapper' ) );
	}

	static getStartURL( { culture = 'en', flow = 'domains', query = '' } = {} ) {
		let route = 'start';
		const queryStrings = [];
		queryStrings.push( 'ref=e2e' );

		if ( flow !== '' ) {
			route += '/' + flow;
		}

		if ( culture !== 'en' ) {
			route += '/' + culture;
		}

		if ( query !== '' ) {
			queryStrings.push( query );
		}

		return dataHelper.getCalypsoURL( route, queryStrings );
	}
}
