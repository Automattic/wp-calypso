/** @format */

import config from 'config';
import { isEqual } from 'lodash';

import * as driverManager from './driver-manager';
import * as driverHelper from './driver-helper';
import * as slackNotifier from './slack-notifier';

export default class AsyncBaseContainer {
	constructor(
		driver,
		expectedElementSelector,
		url = null,
		waitMS = config.get( 'explicitWaitMS' )
	) {
		this.name = this.constructor.name;
		this.driver = driver;
		this.screenSize = driverManager.currentScreenSize().toUpperCase();
		this.expectedElementSelector = expectedElementSelector;
		this.url = url;
		this.explicitWaitMS = waitMS;
		this.visiting = false;
	}

	static async Expect( driver ) {
		const page = new this( driver );
		await page._expectInit();
		return page;
	}

	static async Visit( driver, url ) {
		const page = new this( driver, url );
		if ( ! page.url ) {
			throw new Error( `URL is required to visit the ${ page.name }` );
		}
		page.visiting = true;
		await page._visitInit();
		return page;
	}

	async _visitInit() {
		await this.driver.get( this.url );
		return await this._expectInit();
	}

	async _expectInit() {
		if ( global.__JNSite === true ) {
			await driverHelper.refreshIfJNError( this.driver );
		}
		if ( typeof this._preInit === 'function' ) {
			await this._preInit();
		}
		await this.waitForPage();
		await this.checkForUnknownABTestKeys();
		await this.checkForConsoleErrors();
		if ( typeof this._postInit === 'function' ) {
			await this._postInit();
		}
	}

	async waitForPage() {
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			this.expectedElementSelector,
			this.explicitWaitMS
		);
	}

	async displayed() {
		return await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			this.expectedElementSelector,
			this.explicitWaitMS
		);
	}

	async title() {
		return await this.driver.getTitle();
	}

	async urlDisplayed() {
		return await this.driver.getCurrentUrl();
	}

	async checkForConsoleErrors() {
		return await driverHelper.checkForConsoleErrors( this.driver );
	}

	async checkForUnknownABTestKeys() {
		const knownABTestKeys = config.get( 'knownABTestKeys' );

		return await this.driver
			.executeScript( 'return window.localStorage.ABTests;' )
			.then( abtestsValue => {
				for ( let key in JSON.parse( abtestsValue ) ) {
					let testName = key.split( '_' )[ 0 ];
					if ( knownABTestKeys.indexOf( testName ) < 0 ) {
						const message = `Found an AB Testing key in local storage that isn\'t known: '${ testName }'. This may cause inconsistent A/B test behaviour, please check this is okay and add it to 'knownABTestKeys' in default.config`;
						slackNotifier.warn( message, { suppressDuplicateMessages: true } );
					}
				}
			} );
	}
	async setABTestControlGroupsInLocalStorage() {
		const overrideABTests = config.get( 'overrideABTests' );

		const expectedABTestValue = overrideABTests
			.map( entry => {
				return '"' + entry[ 0 ] + '":"' + entry[ 1 ] + '"';
			} )
			.join( ',' );

		await this.driver.executeScript( 'window.localStorage.clear();' );

		await this.driver.executeScript(
			`window.localStorage.setItem('ABTests','{${ expectedABTestValue }}');`
		);

		let abtestsValue = await this.driver.executeScript( 'return window.localStorage.ABTests;' );
		if ( ! isEqual( JSON.parse( abtestsValue ), JSON.parse( `{${ expectedABTestValue }}` ) ) ) {
			const message = `The localstorage value for AB tests wasn't set correctly.\nExpected value is:\n'{${ expectedABTestValue }}'\nActual value is:\n'${ abtestsValue }'`;
			slackNotifier.warn( message, { suppressDuplicateMessages: true } );
		}

		return this.waitForPage();
	}
}
