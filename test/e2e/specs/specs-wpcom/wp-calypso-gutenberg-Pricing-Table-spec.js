/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';
import config from 'config';
import assert from 'assert';

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
	process.env.COBLOCKS_EDGE === 'true' ? 'coBlocksSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

describe( `[${ host }] Calypso Gutenberg Editor: Pricing Table (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );
	let driver;

	before( 'Start browser', async function () {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
	} );

	describe( 'Insert a Pricing Table block: @parallel', function () {
		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		it( 'Can insert the Pricing Table block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Pricing Table' );
			return await driverHelper.waitUntilElementLocatedAndVisible(
				driver,
				By.css( '.wp-block-coblocks-pricing-table' )
			);
		} );

		/*it( 'Can see Pricing Table block cell elements', async function () {
			
			const pricingTable = By.css( '.wp-block-coblocks-pricing-table__inner.has-columns.has-2-columns.has-responsive-columns.has-medium-gutter' );
			await driverHelper.waitUntilElementLocatedAndVisible( driver, pricingTable );

			const tableCellTitle = By.css( '.wp-block-coblocks-pricing-table-item__title' ); 
			await driverHelper.waitUntilElementLocatedAndVisible( driver, tableCellTitle );

			const cellCurrency = By.css( '.wp-block-coblocks-pricing-table-item__currency' );
			await driverHelper.waitUntilElementLocatedAndVisible( driver, cellCurrency );

			const cellAmount = By.css( '.wp-block-coblocks-pricing-table-item__amount' );
			await driverHelper.waitUntilElementLocatedAndVisible( driver, cellAmount );

			const cellAddFeatures = By.css( '.wp-block-coblocks-pricing-table-item__features' );
			await driverHelper.waitUntilElementLocatedAndVisible( driver, cellAddFeatures );

			const cellButton = By.css( '.wp-block-button__link' );
			return await driverHelper.waitUntilElementLocatedAndVisible(
				driver,cellButton
			);
		});*/

		it( 'Can Edit Pricing Table block cell elements', async function () {
			const pricingTable = By.css(
				'.wp-block-coblocks-pricing-table__inner.has-columns.has-2-columns.has-responsive-columns.has-medium-gutter'
			);
			await driverHelper.waitUntilElementLocatedAndVisible( driver, pricingTable );

			const tableCellTitle = By.css( '.wp-block-coblocks-pricing-table-item__title' );
			await driver.findElement( tableCellTitle ).sendKeys( 'Title Plan' );

			const cellCurrency = By.css( '.wp-block-coblocks-pricing-table-item__currency' );
			await driver.findElement( cellCurrency ).sendKeys( '$' );

			const cellAmount = By.css( '.wp-block-coblocks-pricing-table-item__amount' );
			await driver.findElement( cellAmount ).sendKeys( '150' );

			const cellAddFeatures = By.css( '.wp-block-coblocks-pricing-table-item__features' );
			await driver.findElement( cellAddFeatures ).sendKeys( 'More Feature Coming soon' );

			const cellButton = By.css( '.wp-block-button__link' );
			return await driver.findElement( cellButton ).sendKeys( 'Select' );
		} );

		it( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		it( 'Can see the Edited Pricing Table block in our published post', async function () {
			await driverHelper.waitUntilElementLocatedAndVisible(
				driver,
				By.css( '.entry-content .wp-block-coblocks-pricing-table' )
			);
			const tableCellTitle = By.css( '.wp-block-coblocks-pricing-table-item__title' );
			await driverHelper.waitUntilElementLocatedAndVisible( driver, tableCellTitle );
			let textVal = driver.findElement( tableCellTitle ).getText();
			textVal.then( function ( s ) {
				assert.strictEqual( s, 'Title Plan' );
			} );

			const cellCurrency = By.css( '.wp-block-coblocks-pricing-table-item__currency' );
			await driverHelper.waitUntilElementLocatedAndVisible( driver, cellCurrency );
			textVal = driver.findElement( cellCurrency ).getText();
			textVal.then( function ( s ) {
				assert.strictEqual( s, '$' );
			} );

			const cellAmount = By.css( '.wp-block-coblocks-pricing-table-item__amount' );
			await driverHelper.waitUntilElementLocatedAndVisible( driver, cellAmount );
			textVal = driver.findElement( cellAmount ).getText();
			textVal.then( function ( s ) {
				assert.strictEqual( s, '150' );
			} );

			const cellAddFeatures = By.css( '.wp-block-coblocks-pricing-table-item__features' );
			await driverHelper.waitUntilElementLocatedAndVisible( driver, cellAddFeatures );
			textVal = driver.findElement( cellAddFeatures ).getText();
			textVal.then( function ( s ) {
				assert.strictEqual( s, 'More Feature Coming soon' );
			} );

			const cellButton = By.css( '.wp-block-button__link' );
			await driverHelper.waitUntilElementLocatedAndVisible( driver, cellButton );
			textVal = driver.findElement( cellButton ).getText();
			textVal.then( function ( s ) {
				assert.strictEqual( s, 'Select' );
			} );
		} );
	} );

	describe( 'WPCOM-specific gutter controls: @parallel', function () {
		const gutterControlsLocator = By.css(
			'div[aria-label="Editor settings"] div[aria-label="Gutter"]'
		);

		async function setGutter( buttonText ) {
			const controlsEl = await driver.findElement( gutterControlsLocator );
			const buttonEl = await controlsEl.findElement(
				By.xpath( `//button[text()='${ buttonText }']` )
			);
			const name = { None: 'no', S: 'small', M: 'medium', L: 'large', XL: 'huge' }[ buttonText ];

			await buttonEl.click();
			await driverHelper.waitUntilElementLocatedAndVisible(
				driver,
				By.css( `.wp-block-coblocks-pricing-table__inner.has-${ name }-gutter` )
			);
		}

		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		it( 'Can see gutter controls for supporting block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Pricing Table' );
			await driverHelper.waitUntilElementLocatedAndVisible(
				driver,
				By.css( '.wp-block-coblocks-pricing-table' )
			);
			await gEditorComponent.openSidebar();
			await driverHelper.waitUntilElementLocatedAndVisible( driver, gutterControlsLocator );
		} );

		it( 'Can set the "None" gutter value', async function () {
			await setGutter( 'None' );
		} );

		it( 'Can set the "S" gutter value', async function () {
			await setGutter( 'S' );
		} );

		it( 'Can set the "M" gutter value', async function () {
			await setGutter( 'M' );
		} );

		it( 'Can set the "L" gutter value', async function () {
			await setGutter( 'L' );
		} );

		it( 'Can set the "XL" gutter value', async function () {
			await setGutter( 'XL' );
		} );
	} );
} );
