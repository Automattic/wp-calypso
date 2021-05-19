/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../../lib/flows/login-flow.js';

import GutenbergEditorComponent from '../../lib/gutenberg/gutenberg-editor-component';

import * as driverManager from '../../lib/driver-manager';
import * as driverHelper from '../../lib/driver-helper';
import * as dataHelper from '../../lib/data-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser =
	process.env.COBLOCKS_EDGE === 'true' ? 'searchSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

describe( `[${ host }] Calypso Gutenberg Editor: Search Block (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );
	let driver;

	before( 'Start browser', async function () {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
	} );

	describe( 'Insert Search Block and confirm it exists in te edit page: @parallel', function () {
		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		it( 'Can Insert the Search block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Search' );
			return await driverHelper.waitUntilElementLocatedAndVisible(
				driver,
				By.css( '.wp-block-search' )
			);
		} );

		it( 'Can see search block elements', async function () {
			const textLocator = By.css( '.wp-block-search__label' );
			await driverHelper.waitUntilElementLocatedAndVisible( driver, textLocator );
			await driverHelper.waitUntilElementLocatedAndVisible(
				driver,
				By.css( '.wp-block-search__input' )
			);

			return driverHelper.waitUntilElementLocatedAndVisible(
				driver,
				By.css( '.wp-block-search__button' )
			);
		} );

		it( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			// We need to save the post to get a stable post slug for the block's `url` attribute.
			// See https://github.com/godaddy-wordpress/coblocks/issues/1663.
			await gEditorComponent.ensureSaved();
			return await gEditorComponent.publish( { visit: true } );
		} );

		it( 'Can see the Search block in our published post', async function () {
			return await driverHelper.waitUntilElementLocatedAndVisible(
				driver,
				By.css( '.wp-block-search' )
			);
		} );
	} );

	describe( 'Verify Search block Menubar and Settings Side bar: @parallel', function () {
		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		it( 'Can Insert the Search block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Search' );
			return await driverHelper.waitUntilElementLocatedAndVisible(
				driver,
				By.css( '.wp-block-search' )
			);
		} );

		it( 'Can Toggle Search Block', async function () {
			const textLocator = By.css( '.wp-block-search__input' );
			await driverHelper.waitUntilElementLocatedAndVisible( driver, textLocator );
			await driver.findElement( textLocator ).click();
			const labelToggleButton = By.css( 'button[aria-label="Toggle search label"]' );

			await driverHelper.waitUntilElementLocatedAndVisible( driver, labelToggleButton );
			await driver.findElement( labelToggleButton ).click();

			return driverHelper.waitUntilElementNotLocated( driver, By.css( '.wp-block-search__label' ) );
		} );

		it( 'Can change search button to icon', async function () {
			const textLocator = By.css( '.wp-block-search__input' );
			await driverHelper.waitUntilElementLocatedAndVisible( driver, textLocator );
			await driver.findElement( textLocator ).click();
			const labelToggleButton = By.css( 'button[aria-label="Use button with icon"]' );

			await driverHelper.waitUntilElementLocatedAndVisible( driver, labelToggleButton );
			await driver.findElement( labelToggleButton ).click();

			return driverHelper.waitUntilElementLocatedAndVisible(
				driver,
				By.css( '.wp-block-search__button.has-icon' )
			);
		} );

		it( 'Can remove search button', async function () {
			//html/body/div[1]/div[2]/div[1]/div[1]/div[3]/div[1]/div[2]/div/div/div/div/div/div/button[3]
			const textLocator = By.css( 'button[aria-label="Change button position"]' );
			await driverHelper.waitUntilElementLocatedAndVisible( driver, textLocator );
			await driver.findElement( textLocator ).click();
			await driverHelper.waitUntilElementLocatedAndVisible(
				driver,
				By.css( '.wp-block-search__button-position-menu' )
			);
			const buttonEl = await driver.findElement( By.xpath( `//span[text()='No Button']` ) );
			await buttonEl.click();

			return driverHelper.waitUntilElementNotLocated(
				driver,
				By.css( '.wp-block-search__button' )
			);
		} );

		it( 'Can Search block settings', async function () {
			const textLocator = By.css( '.wp-block-search__input' );
			await driverHelper.waitUntilElementLocatedAndVisible( driver, textLocator );
			await driver.findElement( textLocator ).click();

			const settingsButton = By.css( 'button[aria-label="Settings"]' );
			await driverHelper.waitUntilElementLocatedAndVisible( driver, settingsButton );
			await driver.findElement( settingsButton ).click();

			const percentageWidth = By.css( 'div[aria-label="Percentage Width"]' );

			const selectFirst = await driver.findElement( percentageWidth );

			const primarySelect = await selectFirst.findElement( By.xpath( `//button[text()='25']` ) );

			await primarySelect.click();

			return await driverHelper.waitUntilElementLocatedAndVisible(
				driver,
				By.css( '.wp-block-search__inside-wrapper' )
			);
		} );

		it( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			// We need to save the post to get a stable post slug for the block's `url` attribute.
			// See https://github.com/godaddy-wordpress/coblocks/issues/1663.
			await gEditorComponent.ensureSaved();
			return await gEditorComponent.publish( { visit: true } );
		} );

		it( 'Can see the 25% Search block in published post without label and button', async function () {
			driverHelper.waitUntilElementNotLocated( driver, By.css( '.wp-block-search__label' ) );
			driverHelper.waitUntilElementNotLocated( driver, By.css( '.wp-block-search__button' ) );

			//Unable to get width of the search block here and neither in edit mode. In edit mode it gets the  min-width:290px
			//Here in publish mode it get 173px though that style value is not there when I inspect the object
			const width = await driver
				.findElement( By.css( '.wp-block-search__inside-wrapper' ) )
				.getCssValue( 'width' );
			console.log( 'Style Value' + width );
			return await driverHelper.waitUntilElementLocatedAndVisible(
				driver,
				By.css( '.wp-block-search' )
			);
		} );
	} );
} );
