/** @format */

import { By as by, until } from 'selenium-webdriver';

import * as driverHelper from '../driver-helper';
import * as driverManager from '../driver-manager';
import * as slackNotifier from '../slack-notifier';
import AsyncBaseContainer from '../async-base-container';

export default class CustomizerPage extends AsyncBaseContainer {
	constructor( driver ) {
		const expectedElementSelector = by.css( '.is-section-customize' );
		super( driver, expectedElementSelector );
		this.metaiFrameElementSelector = by.css( 'iframe.is-iframe-loaded' );
		this.reloadCustomizerSelector = by.css( '.empty-content__action.button' );
		this.saveSelector = by.css( '#save' );
		this.shortSleepMS = 1000;
	}

	async _postInit() {
		return await this.waitForCustomizer();
	}

	async waitForCustomizer() {
		const self = this;
		self.driver
			.wait( until.elementLocated( this.metaiFrameElementSelector ), this.explicitWaitMS * 2 )
			.then(
				function() {},
				function( error ) {
					const message = `Found issue on customizer page: '${ error }' - Clicking try again button now.`;
					slackNotifier.warn( message );
					self.driver
						.wait( function() {
							return driverHelper.isElementPresent( self.driver, self.reloadCustomizerSelector );
						}, self.explicitWaitMS )
						.then(
							function() {
								driverHelper.clickWhenClickable(
									self.driver,
									self.reloadCustomizerSelector,
									self.explicitWaitMS
								);
							},
							function( err ) {
								console.log(
									`Could not locate reload button to click in the customizer: '${ err }'`
								);
							}
						);
				}
			);
		this._switchToMetaiFrame();
		return self.driver.switchTo().defaultContent();
	}

	async close() {
		const self = this;
		self._ensureMetaViewOnMobile();
		self._switchToMetaiFrame();
		return self.driver.sleep( self.shortSleepMS ).then( () => {
			return driverHelper
				.clickWhenClickable( self.driver, by.css( '.customize-controls-close' ) )
				.then( () => {
					return self._switchToDefaultContent();
				} );
		} );
	}

	async _ensureMetaViewOnMobile() {
		const driver = this.driver;
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			this._switchToMetaiFrame();
			driverHelper
				.isElementPresent( driver, by.css( 'div.preview-desktop.preview-only' ) )
				.then( previewDisplayed => {
					if ( previewDisplayed === true ) {
						driverHelper.clickWhenClickable(
							driver,
							by.css( 'button.customize-controls-preview-toggle' )
						);
					}
				} );
			return this._switchToDefaultContent();
		}
	}

	async _switchToMetaiFrame() {
		this._switchToDefaultContent();
		this.driver.wait(
			until.ableToSwitchToFrame( this.metaiFrameElementSelector ),
			this.explicitWaitMS,
			'Can not switch to the meta iFrame on customizer'
		);
		return await this.driver.wait(
			until.elementLocated( this.saveSelector ),
			this.explicitWaitMS,
			'Could not locate the save option on customizer'
		);
	}

	async _switchToDefaultContent() {
		return await this.driver.switchTo().defaultContent();
	}
}
