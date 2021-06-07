/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';
import config from 'config';
import assert from 'assert';

/**
 * Internal dependencies
 */

import GutenbergEditorComponent from '../../lib/gutenberg/gutenberg-editor-component';
import PricingTableBlockComponent from '../../lib/gutenberg/blocks/pricing-table-block-component';

import * as driverManager from '../../lib/driver-manager';
import * as driverHelper from '../../lib/driver-helper';
import * as dataHelper from '../../lib/data-helper';
import LoginFlow from '../../lib/flows/login-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser =
	process.env.COBLOCKS_EDGE === 'true' ? 'coBlocksSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

describe( `[${ host }] Calypso Gutenberg Editor: Pricing Table (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );
	let driver;
	let pricingTableBlock;

	describe( 'Insert a Pricing Table block: @parallel', function () {
		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( this.driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		it( 'Can insert the Pricing Table block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Pricing Table' );
			pricingTableBlock = await PricingTableBlockComponent.Expect( driver );
			return await pricingTableBlock.pricingBlockVisible();
		} );

		it( 'Can see Pricing Table block cell elements', async function () {
			pricingTableBlock = await PricingTableBlockComponent.Expect( driver );
			await pricingTableBlock.pricingBlockVisible();
			await pricingTableBlock.defaultPricingTableVisible();
			await pricingTableBlock.pricingTableItemTitleVisible();
			await pricingTableBlock.pricingTableItemCurrencyVisible();
			await pricingTableBlock.pricingTableItemAmountVisible();
			await pricingTableBlock.pricingTableItemFeaturesVisible();
			return await pricingTableBlock.pricingTableItemButtonVisible();
		} );

		it( 'Can Edit Submit button to add a link', async function () {
			pricingTableBlock = await PricingTableBlockComponent.Expect( driver );
			await pricingTableBlock.pricingTableItemButtonClick();
			await pricingTableBlock.pricingTableItemButtonLinkVisible();
			await pricingTableBlock.pricingTableItemButtonLinkClick();
			await pricingTableBlock.pricingTableItemButtonLinkInputVisible();
			await pricingTableBlock.pricingTableItemButtonLinkInputSendKeys( 'https://wordpress.org/' );
			await pricingTableBlock.pricingTableItemButtonLinkSubmitButtonClick();
			return await pricingTableBlock.pricingTableItemButtonLinkInputSelectedVisible();
		} );

		it( 'Can Edit Pricing Table block cell elements', async function () {
			pricingTableBlock = await PricingTableBlockComponent.Expect( driver );
			await pricingTableBlock.defaultPricingTableVisible();
			await pricingTableBlock.pricingTableItemTitleSendKeys( 'Title Plan' );
			await pricingTableBlock.pricingTableItemCurrencySendKeys( '$' );
			await pricingTableBlock.pricingTableItemAmountSendKeys( '150' );
			await pricingTableBlock.pricingTableItemFeaturesSendKeys( 'More Feature Coming soon' );
			return await pricingTableBlock.pricingTableItemButtonSendKeys( 'Select' );
		} );

		it( 'Can change Pricing table menu bar setting', async function () {
			pricingTableBlock = await PricingTableBlockComponent.Expect( driver, 2 );
			await pricingTableBlock.pricingTableItemTitleClick();
			await pricingTableBlock.pricingTableParentSelectorVisible();
			await pricingTableBlock.pricingTableParentSelectorClick();
			await pricingTableBlock.pricingTableParentSelectorVisible();
			await pricingTableBlock.pricingTableParentSelectorClick();
			await pricingTableBlock.pricingTableChangeTextAlignmentVisible();
			await pricingTableBlock.pricingTableChangeTextAlignmentClick();
			await pricingTableBlock.pricingTableAlignLeftVisible();
			await pricingTableBlock.pricingTableAlignLeftClick();
			return await pricingTableBlock.pricingTableLeftAlignedBlockVisible();
		} );

		it( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		it( 'Can see the Edited Pricing Table block in our published post', async function () {
			pricingTableBlock = await PricingTableBlockComponent.Expect( driver );
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

		it( 'Can click on Select button and check after submit page', async function () {
			pricingTableBlock = await PricingTableBlockComponent.Expect( driver );
			await pricingTableBlock.pricingTableItemButtonClick();
			return await pricingTableBlock.pricingTableToWordpressOrgVisible();
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
			pricingTableBlock = await PricingTableBlockComponent.Expect( driver );
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

	describe( 'Pricing Table block change table count: @parallel', function () {
		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		it( 'Can insert the Pricing Table block and default table count is 2', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Pricing Table' );
			pricingTableBlock = await PricingTableBlockComponent.Expect( driver );
			return await pricingTableBlock.defaultPricingTableVisible();
		} );

		it( 'Can change Pricing table count to 1 ', async function () {
			pricingTableBlock = await PricingTableBlockComponent.Expect( driver );
			await pricingTableBlock.pricingTableItemTitleClick();
			await pricingTableBlock.pricingTableParentSelectorVisible();
			await pricingTableBlock.pricingTableParentSelectorClick();
			await pricingTableBlock.pricingTableParentSelectorVisible();
			await pricingTableBlock.pricingTableParentSelectorClick();
			await pricingTableBlock.pricingTableChangeTableCountVisible();
			await pricingTableBlock.pricingTableChangeTableCountClick();
			await pricingTableBlock.pricingTableCountPopOverVisible();
			await pricingTableBlock.pricingTableCellSelectClick( 'One Pricing Table' );
			await driverHelper.waitUntilElementLocatedAndVisible(
				driver,
				By.css( `.wp-block-coblocks-pricing-table__inner.has-1-columns.has-medium-gutter` )
			);
		} );

		it( 'Can change Pricing table count to 3 ', async function () {
			pricingTableBlock = await PricingTableBlockComponent.Expect( driver );
			await pricingTableBlock.pricingTableItemButtonClick();
			await pricingTableBlock.pricingTableParentSelectorVisible();
			await pricingTableBlock.pricingTableParentSelectorClick();
			await pricingTableBlock.pricingTableParentSelectorVisible();
			await pricingTableBlock.pricingTableParentSelectorClick();
			await pricingTableBlock.pricingTableChangeTableCountVisible();
			await pricingTableBlock.pricingTableChangeTableCountClick();
			await pricingTableBlock.pricingTableCountPopOverVisible();
			await pricingTableBlock.pricingTableCellSelectClick( 'Three Pricing Tables' );
			await driverHelper.waitUntilElementLocatedAndVisible(
				driver,
				By.css(
					`.wp-block-coblocks-pricing-table__inner.has-columns.has-3-columns.has-responsive-columns.has-medium-gutter`
				)
			);
		} );

		it( 'Can change Pricing table count to 4 ', async function () {
			pricingTableBlock = await PricingTableBlockComponent.Expect( driver );
			await pricingTableBlock.pricingTableItemButtonClick();
			await pricingTableBlock.pricingTableParentSelectorVisible();
			await pricingTableBlock.pricingTableParentSelectorClick();
			await pricingTableBlock.pricingTableParentSelectorVisible();
			await pricingTableBlock.pricingTableParentSelectorClick();
			await pricingTableBlock.pricingTableChangeTableCountVisible();
			await pricingTableBlock.pricingTableChangeTableCountClick();
			await pricingTableBlock.pricingTableCountPopOverVisible();
			await pricingTableBlock.pricingTableCellSelectClick( 'Four Pricing Tables' );
			await driverHelper.waitUntilElementLocatedAndVisible(
				driver,
				By.css(
					`.wp-block-coblocks-pricing-table__inner.has-columns.has-4-columns.has-responsive-columns.has-medium-gutter`
				)
			);
		} );
	} );
} );
