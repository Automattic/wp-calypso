/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';

import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component';

import * as driverManager from '../lib/driver-manager';
import * as driverHelper from '../lib/driver-helper';
import * as dataHelper from '../lib/data-helper';
import * as mediaHelper from '../lib/media-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser =
	process.env.COBLOCKS_EDGE === 'true' ? 'coBlocksSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
	await driver.sleep( Math.random() * Math.floor( 5000 ) );
} );

describe( `[${ host }] Calypso Gutenberg Editor: CoBlocks (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Insert a Click to Tweet block: @parallel', function () {
		step( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can insert the Click to Tweet block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Click to Tweet' );
			return await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.wp-block-coblocks-click-to-tweet' )
			);
		} );

		step( 'Can enter text to tweet', async function () {
			const textSelector = By.css( '.wp-block-coblocks-click-to-tweet__text' );
			await driverHelper.waitTillPresentAndDisplayed( driver, textSelector );
			return await driver
				.findElement( textSelector )
				.sendKeys(
					'The foolish man seeks happiness in the distance. The wise grows it under his feet. — James Oppenheim'
				);
		} );

		step( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			// We need to save the post to get a stable post slug for the block's `url` attribute.
			// See https://github.com/godaddy-wordpress/coblocks/issues/1663.
			await gEditorComponent.ensureSaved();
			return await gEditorComponent.publish( { visit: true, closePanel: false } );
		} );

		step( 'Can see the Click to Tweet block in our published post', async function () {
			return await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.entry-content .wp-block-coblocks-click-to-tweet' )
			);
		} );
	} );

	describe( 'Insert a Dynamic HR block: @parallel', function () {
		step( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can insert the Dynamic HR block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Dynamic HR' );
			return await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.wp-block-coblocks-dynamic-separator' )
			);
		} );

		step( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		step( 'Can see the Dynamic HR block in our published post', async function () {
			return await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.entry-content .wp-block-coblocks-dynamic-separator' )
			);
		} );
	} );

	describe( 'Insert a Hero block: @parallel', function () {
		step( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can insert the Hero block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Hero' );
			return await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.wp-block-coblocks-hero' )
			);
		} );

		step( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		step( 'Can see the Hero block in our published post', async function () {
			return await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.entry-content .wp-block-coblocks-hero' )
			);
		} );
	} );

	describe( 'Insert a Logos block: @parallel', function () {
		let fileDetails;

		// Create image file for upload
		before( async function () {
			fileDetails = await mediaHelper.createFile();
			return fileDetails;
		} );

		step( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can insert the Logos block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Logos' );
			return await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.wp-block-coblocks-logos' )
			);
		} );

		step( 'Can select an image as a logo', async function () {
			await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.block-editor-media-placeholder' )
			);
			await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.components-form-file-upload ' )
			);
			const filePathInput = await driver.findElement(
				By.css( '.components-form-file-upload input[type="file"]' )
			);
			await filePathInput.sendKeys( fileDetails.file );
			return await driverHelper.waitTillNotPresent(
				driver,
				By.css( '.wp-block-image .components-spinner' )
			);
		} );

		step( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		step( 'Can see the Logos block in our published post', async function () {
			return await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.entry-content .wp-block-coblocks-logos' )
			);
		} );
	} );

	describe( 'Insert a Pricing Table block: @parallel', function () {
		step( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can insert the Pricing Table block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Pricing Table' );
			return await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.wp-block-coblocks-pricing-table' )
			);
		} );

		step( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		step( 'Can see the Pricing Table block in our published post', async function () {
			return await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.entry-content .wp-block-coblocks-pricing-table' )
			);
		} );
	} );

	describe( 'WPCOM-specific gutter controls: @parallel', async function () {
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
			await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( `.wp-block-coblocks-pricing-table__inner.has-${ name }-gutter` )
			);
		}

		step( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can see gutter controls for supporting block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Pricing Table' );
			await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.wp-block-coblocks-pricing-table' )
			);
			await gEditorComponent.openSidebar();
			await driverHelper.waitTillPresentAndDisplayed( driver, gutterControlsLocator );
		} );

		step( 'Can set the "None" gutter value', async function () {
			await setGutter( 'None' );
		} );

		step( 'Can set the "S" gutter value', async function () {
			await setGutter( 'S' );
		} );

		step( 'Can set the "M" gutter value', async function () {
			await setGutter( 'M' );
		} );

		step( 'Can set the "L" gutter value', async function () {
			await setGutter( 'L' );
		} );

		step( 'Can set the "XL" gutter value', async function () {
			await setGutter( 'XL' );
		} );
	} );
} );
