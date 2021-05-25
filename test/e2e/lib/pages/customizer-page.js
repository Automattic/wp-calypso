/**
 * External dependencies
 */
import { By, until } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper';
import * as driverManager from '../driver-manager';
import * as slackNotifier from '../slack-notifier';
import AsyncBaseContainer from '../async-base-container';

export default class CustomizerPage extends AsyncBaseContainer {
	constructor( driver ) {
		const expectedElementLocator = By.css( '.is-section-customize' );
		super( driver, expectedElementLocator );
		this.metaiFrameElementLocator = By.css( 'iframe.is-iframe-loaded' );
		this.reloadCustomizerLocator = By.css( '.empty-content__action.button' );
		this.saveLocator = By.css( '#save' );
		this.shortSleepMS = 1000;
	}

	async _postInit() {
		return await this.waitForCustomizer();
	}

	async waitForCustomizer() {
		const self = this;
		await self.driver
			.wait( until.elementLocated( this.metaiFrameElementLocator ), this.explicitWaitMS * 2 )
			.then(
				function () {},
				async function ( error ) {
					const message = `Found issue on customizer page: '${ error }' - Clicking try again button now.`;
					slackNotifier.warn( message );
					await self.driver
						.wait( async function () {
							return await driverHelper.isElementLocated(
								self.driver,
								self.reloadCustomizerLocator
							);
						}, self.explicitWaitMS )
						.then(
							async function () {
								await driverHelper.clickWhenClickable(
									self.driver,
									self.reloadCustomizerLocator,
									self.explicitWaitMS
								);
							},
							function ( err ) {
								console.log(
									`Could not locate reload button to click in the customizer: '${ err }'`
								);
							}
						);
				}
			);
		await this._switchToMetaiFrame();
		return await self.driver.switchTo().defaultContent();
	}

	async close() {
		const self = this;
		await self._ensureMetaViewOnMobile();
		await self._switchToMetaiFrame();
		await self.driver.sleep( self.shortSleepMS );
		await driverHelper.clickWhenClickable( self.driver, By.css( '.customize-controls-close' ) );
		return await self._switchToDefaultContent();
	}

	async _ensureMetaViewOnMobile() {
		const driver = this.driver;
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			await this._switchToMetaiFrame();
			const previewDisplayed = await driverHelper.isElementLocated(
				driver,
				By.css( 'div.preview-desktop.preview-only' )
			);
			if ( previewDisplayed === true ) {
				await driverHelper.clickWhenClickable(
					driver,
					By.css( 'button.customize-controls-preview-toggle' )
				);
			}
			return await this._switchToDefaultContent();
		}
	}

	async _switchToMetaiFrame() {
		await this._switchToDefaultContent();
		await this.driver.wait(
			until.ableToSwitchToFrame( this.metaiFrameElementLocator ),
			this.explicitWaitMS,
			'Can not switch to the meta iFrame on customizer'
		);
		return await this.driver.wait(
			until.elementLocated( this.saveLocator ),
			this.explicitWaitMS,
			'Could not locate the save option on customizer'
		);
	}

	async _switchToDefaultContent() {
		return await this.driver.switchTo().defaultContent();
	}
}
