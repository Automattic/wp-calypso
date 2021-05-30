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
import PricingTableBlockComponent from '../../lib/gutenberg/blocks/pricing-table-block-component';

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
	let pricingTableBlock;

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
			pricingTableBlock = await PricingTableBlockComponent.Expect( driver, 2 );
			return await pricingTableBlock.pricingBlockVisible();
		} );

		it( 'Can see Pricing Table block cell elements', async function () {
			pricingTableBlock = await PricingTableBlockComponent.Expect( driver, 2 );
			await pricingTableBlock.pricingBlockVisible();
			await pricingTableBlock.defaultPricingTableVisible();
			await pricingTableBlock.pricingTableItemTitleVisible();
			await pricingTableBlock.pricingTableItemCurrencyVisible();
			await pricingTableBlock.pricingTableItemAmountVisible();
			await pricingTableBlock.pricingTableItemFeaturesVisible();
			return await pricingTableBlock.pricingTableItemButtonVisible();
		} );

		it( 'Can Edit Pricing Table block cell elements', async function () {
			pricingTableBlock = await PricingTableBlockComponent.Expect( driver, 2 );
			await pricingTableBlock.defaultPricingTableVisible();
			await pricingTableBlock.pricingTableItemTitleSendKeys( 'Title Plan' );
			await pricingTableBlock.pricingTableItemCurrencySendKeys( '$' );
			await pricingTableBlock.pricingTableItemAmountSendKeys( '150' );
			await pricingTableBlock.pricingTableItemFeaturesSendKeys( 'More Feature Coming soon' );
			return await pricingTableBlock.pricingTableItemButtonSendKeys( 'Select' );
		} );

		it( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver, 2 );
			return await gEditorComponent.publish( { visit: true } );
		} );

		it( 'Can see the Edited Pricing Table block in our published post', async function () {
			pricingTableBlock = await PricingTableBlockComponent.Expect( driver, 2 );
			await pricingTableBlock.pricingBlockVisible();

			await pricingTableBlock.pricingTableItemTitleVisible();
			let textVal = pricingTableBlock.pricingTableItemTitleGetText();
			textVal.then( function ( s ) {
				assert.strictEqual( s, 'Title Plan' );
			} );

			await pricingTableBlock.pricingTableItemCurrencyVisible();
			textVal = pricingTableBlock.pricingTableItemCurrencyGetText();
			textVal.then( function ( s ) {
				assert.strictEqual( s, '$' );
			} );

			await pricingTableBlock.pricingTableItemAmountVisible();
			textVal = pricingTableBlock.pricingTableItemAmountGetText();
			textVal.then( function ( s ) {
				assert.strictEqual( s, '150' );
			} );

			await pricingTableBlock.pricingTableItemFeaturesVisible();
			textVal = pricingTableBlock.pricingTableItemFeaturesGetText();
			textVal.then( function ( s ) {
				assert.strictEqual( s, 'More Feature Coming soon' );
			} );

			await pricingTableBlock.pricingTableItemButtonVisible();
			textVal = pricingTableBlock.pricingTableItemButtonGetText();
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
			pricingTableBlock = await PricingTableBlockComponent.Expect( driver, 2 );
			await await pricingTableBlock.pricingBlockVisible();
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
