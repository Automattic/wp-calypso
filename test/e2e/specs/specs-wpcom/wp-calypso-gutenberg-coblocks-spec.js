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
import * as mediaHelper from '../../lib/media-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser =
	process.env.COBLOCKS_EDGE === 'true' ? 'coBlocksSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

describe( `[${ host }] Calypso Gutenberg Editor: CoBlocks (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Insert a Click to Tweet block: @parallel', function () {
		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( this.driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		it( 'Can insert the Click to Tweet block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			await gEditorComponent.addBlock( 'Click to Tweet' );
			return await driverHelper.waitUntilElementLocatedAndVisible(
				this.driver,
				By.css( '.wp-block-coblocks-click-to-tweet' )
			);
		} );

		it( 'Can enter text to tweet', async function () {
			const textLocator = By.css( '.wp-block-coblocks-click-to-tweet__text' );
			await driverHelper.waitUntilElementLocatedAndVisible( this.driver, textLocator );
			return await this.driver
				.findElement( textLocator )
				.sendKeys(
					'The foolish man seeks happiness in the distance. The wise grows it under his feet. — James Oppenheim'
				);
		} );

		it( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			// We need to save the post to get a stable post slug for the block's `url` attribute.
			// See https://github.com/godaddy-wordpress/coblocks/issues/1663.
			await gEditorComponent.ensureSaved();
			return await gEditorComponent.publish( { visit: true } );
		} );

		it( 'Can see the Click to Tweet block in our published post', async function () {
			return await driverHelper.waitUntilElementLocatedAndVisible(
				this.driver,
				By.css( '.entry-content .wp-block-coblocks-click-to-tweet' )
			);
		} );
	} );

	describe( 'Insert a Dynamic HR block: @parallel', function () {
		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( this.driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		it( 'Can insert the Dynamic HR block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			await gEditorComponent.addBlock( 'Dynamic HR' );
			return await driverHelper.waitUntilElementLocatedAndVisible(
				this.driver,
				By.css( '.wp-block-coblocks-dynamic-separator' )
			);
		} );

		it( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		it( 'Can see the Dynamic HR block in our published post', async function () {
			return await driverHelper.waitUntilElementLocatedAndVisible(
				this.driver,
				By.css( '.entry-content .wp-block-coblocks-dynamic-separator' )
			);
		} );
	} );

	describe( 'Insert a Hero block: @parallel', function () {
		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( this.driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		it( 'Can insert the Hero block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			await gEditorComponent.addBlock( 'Hero' );
			return await driverHelper.waitUntilElementLocatedAndVisible(
				this.driver,
				By.css( '.wp-block-coblocks-hero' )
			);
		} );

		it( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		it( 'Can see the Hero block in our published post', async function () {
			return await driverHelper.waitUntilElementLocatedAndVisible(
				this.driver,
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

		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( this.driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		it( 'Can insert the Logos block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			await gEditorComponent.addBlock( 'Logos' );
			return await driverHelper.waitUntilElementLocatedAndVisible(
				this.driver,
				By.css( '.wp-block-coblocks-logos' )
			);
		} );

		it( 'Can select an image as a logo', async function () {
			await driverHelper.waitUntilElementLocatedAndVisible(
				this.driver,
				By.css( '.block-editor-media-placeholder' )
			);
			await driverHelper.waitUntilElementLocatedAndVisible(
				this.driver,
				By.css( '.components-form-file-upload ' )
			);
			const filePathInput = await this.driver.findElement(
				By.css( '.components-form-file-upload input[type="file"]' )
			);
			await filePathInput.sendKeys( fileDetails.file );
			return await driverHelper.waitUntilElementNotLocated(
				this.driver,
				By.css( '.wp-block-image .components-spinner' )
			);
		} );

		it( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		it( 'Can see the Logos block in our published post', async function () {
			return await driverHelper.waitUntilElementLocatedAndVisible(
				this.driver,
				By.css( '.entry-content .wp-block-coblocks-logos' )
			);
		} );
	} );

	describe( 'Insert a Pricing Table block: @parallel', function () {
		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( this.driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		it( 'Can insert the Pricing Table block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			await gEditorComponent.addBlock( 'Pricing Table' );
			return await driverHelper.waitUntilElementLocatedAndVisible(
				this.driver,
				By.css( '.wp-block-coblocks-pricing-table' )
			);
		} );

		it( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		it( 'Can see the Pricing Table block in our published post', async function () {
			return await driverHelper.waitUntilElementLocatedAndVisible(
				this.driver,
				By.css( '.entry-content .wp-block-coblocks-pricing-table' )
			);
		} );
	} );

	describe( 'WPCOM-specific gutter controls: @parallel', function () {
		const gutterControlsLocator = By.css(
			'div[aria-label="Editor settings"] div[aria-label="Gutter"]'
		);

		const gutters = { None: 'no', S: 'small', M: 'medium', L: 'large', XL: 'huge' };
		async function setGutter( driver, buttonText ) {
			const gutterName = gutters[ buttonText ];
			const buttonEl = await driver
				.findElement( gutterControlsLocator )
				.findElement( By.xpath( `//button[text()='${ buttonText }']` ) );

			await driverHelper.clickWhenClickable( driver, () => buttonEl );
			await driverHelper.waitUntilElementLocatedAndVisible(
				driver,
				By.css( `.wp-block-coblocks-pricing-table__inner.has-${ gutterName }-gutter` )
			);
		}

		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( this.driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		it( 'Can see gutter controls for supporting block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			await gEditorComponent.addBlock( 'Pricing Table' );
			await driverHelper.waitUntilElementLocatedAndVisible(
				this.driver,
				By.css( '.wp-block-coblocks-pricing-table' )
			);
			await gEditorComponent.openSidebar();
			await driverHelper.waitUntilElementLocatedAndVisible( this.driver, gutterControlsLocator );
		} );

		Object.keys( gutters ).forEach( ( gutter ) => {
			it( `Can set the ${ gutter } gutter value`, async function () {
				await setGutter( this.driver, gutter );
			} );
		} );
	} );
} );
