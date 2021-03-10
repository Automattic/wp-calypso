/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */

import LoginFlow from '../lib/flows/login-flow.js';

import ViewPostPage from '../lib/pages/view-post-page.js';

import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component';
import PostPreviewComponent from '../lib/components/post-preview-component';
import { ImageBlockComponent } from '../lib/gutenberg/blocks/image-block-component';

import * as driverManager from '../lib/driver-manager';
import * as driverHelper from '../lib/driver-helper';
import * as mediaHelper from '../lib/media-helper';
import * as dataHelper from '../lib/data-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser =
	process.env.GUTENBERG_EDGE === 'true' ? 'gutenbergSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

describe( `[${ host }] Calypso Gutenberg Editor: Cover Block (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );
	let driver;

	before( 'Start browser', async function () {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
	} );

	xdescribe( 'Cover Block: Preview and Publish default cover block', function () {
		const blogPostTitle = dataHelper.randomPhrase();

		step( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can enter post title', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.enterTitle( blogPostTitle );
		} );

		step( 'Can add the cover block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Cover' );

			return await driverHelper.waitTillPresentAndDisplayed( driver, By.css( '.wp-block-cover' ) );
		} );

		step( 'Can launch post preview', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.ensureSaved();
			await gEditorComponent.launchPreview();
		} );

		step( 'Can see correct post title in preview', async function () {
			this.postPreviewComponent = await PostPreviewComponent.Expect( driver );

			const postTitle = await this.postPreviewComponent.postTitle();
			assert.strictEqual(
				postTitle.toLowerCase(),
				blogPostTitle.toLowerCase(),
				'The blog post preview title is not correct'
			);
		} );

		step( 'Can see the cover block in our published post', async function () {
			return await driverHelper.waitTillPresentAndDisplayed( driver, By.css( '.wp-block-cover' ) );
		} );
	} );

	xdescribe( 'Cover Block: Preview and Publish cover block with image and text', function () {
		let fileDetails;
		const blogPostTitle = dataHelper.randomPhrase();
		const coverTitle = dataHelper.randomPhrase();

		// Create image file for upload
		before( async function () {
			fileDetails = await mediaHelper.createFile();
			return fileDetails;
		} );

		step( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can enter post title', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.enterTitle( blogPostTitle );
		} );

		step( 'Can add cover block with image and title', async function () {
			const textSelector = By.css( '.block-editor-rich-text__editable' );
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			const blockID = await gEditorComponent.addBlock( 'Cover' );

			const imageBlock = await ImageBlockComponent.Expect( driver, blockID );
			await imageBlock.uploadImage( fileDetails );

			await driverHelper.waitTillPresentAndDisplayed( driver, textSelector );
			await driver.findElement( textSelector ).sendKeys( coverTitle );

			return await driverHelper.waitTillPresentAndDisplayed( driver, By.css( '.wp-block-cover' ) );
		} );

		step( 'Can launch post preview', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.ensureSaved();
			await gEditorComponent.launchPreview();
		} );

		step( 'Can see correct post title in preview', async function () {
			this.postPreviewComponent = await PostPreviewComponent.Expect( driver );

			const postTitle = await this.postPreviewComponent.postTitle();
			assert.strictEqual(
				postTitle.toLowerCase(),
				blogPostTitle.toLowerCase(),
				'The blog post preview title is not correct'
			);
		} );

		step( 'Can see the cover block in our published post', async function () {
			await ViewPostPage.Expect( driver );
			return await driverHelper.waitTillPresentAndDisplayed( driver, By.css( '.wp-block-cover' ) );
		} );

		step( 'Cover text matches published cover text', async function () {
			await ViewPostPage.Expect( driver );
			const publishedCoverTitle = await driver
				.findElement( By.css( '.wp-block-cover__inner-container' ) )
				.getText();

			assert.strictEqual(
				publishedCoverTitle,
				coverTitle,
				'Cover text did not match text in published post'
			);
		} );

		step( 'Image matches the image published', async function () {
			await ViewPostPage.Expect( driver );

			const coverElement = await driver.findElement( By.css( '.wp-block-cover' ) );
			const imgElement = await coverElement.findElement( By.xpath( '//img' ) );
			const imgPath = await imgElement.getAttribute( 'src' );

			// Parse off the path
			const imgFilename = imgPath.replace( /^.*[\\/]/, '' );

			// Only check image filename since alt text not currently set
			assert.strictEqual(
				imgFilename,
				fileDetails.fileName,
				'Image file did not match image in the published post'
			);
		} );

		after( async function () {
			if ( fileDetails ) {
				await mediaHelper.deleteFile( fileDetails );
			}
			await driverHelper.acceptAlertIfPresent( driver );
		} );
	} );

	describe( 'Cover Block: Preview and Publish cover block with full width alignment', function () {
		let fileDetails;
		const blogPostTitle = dataHelper.randomPhrase();
		const coverTitle = dataHelper.randomPhrase();

		// Create image file for upload
		before( async function () {
			fileDetails = await mediaHelper.createFile();
			return fileDetails;
		} );

		step( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can enter post title', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.enterTitle( blogPostTitle );
		} );

		step( 'Can add cover block with image and title', async function () {
			// const textSelector = By.css( '.block-editor-rich-text__editable' );
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			const blockID = await gEditorComponent.addBlock( 'Cover' );

			const imageBlock = await ImageBlockComponent.Expect( driver, blockID );
			await imageBlock.uploadImage( fileDetails );

			// Regardless of whether this is included the Paragraph block still gets created
			// preventing the menu from the cover block coming up
			// await driverHelper.waitTillPresentAndDisplayed( driver, textSelector );
			// await driver.findElement( textSelector ).sendKeys( coverTitle );

			//Trying to click the cover block directly various ways

			// const coverBlock = await driver.findElement(
			// By.css( '.wp-block-cover' )
			// );
			// await coverBlock.click();

			// Try and click a different element and then click the cover block
			// await driverHelper.waitTillPresentAndDisplayed( driver, By.css( '.wp-block-cover' ) );
			// await driverHelper.clickWhenClickable( driver, By.css( `.editor-post-title` ) );

			await driverHelper.clickWhenClickable( driver, By.css( `.wp-block-cover` ) );

			// It never finds this as the menu does not get opened
			const alignmentSelector = By.css( '.components-dropdown-menu' );
			await driverHelper.waitTillPresentAndDisplayed( driver, By.css( alignmentSelector ) );
			await driverHelper.clickWhenClickable( driver, By.css( alignmentSelector ) );

			return await driverHelper.waitTillPresentAndDisplayed( driver, By.css( '.wp-block-cover' ) );
		} );

		step( 'Can launch post preview', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.ensureSaved();
			await gEditorComponent.launchPreview();
		} );

		step( 'Can see correct post title in preview', async function () {
			this.postPreviewComponent = await PostPreviewComponent.Expect( driver );

			const postTitle = await this.postPreviewComponent.postTitle();
			assert.strictEqual(
				postTitle.toLowerCase(),
				blogPostTitle.toLowerCase(),
				'The blog post preview title is not correct'
			);
		} );

		step( 'Can see the cover block in our published post', async function () {
			await ViewPostPage.Expect( driver );
			return await driverHelper.waitTillPresentAndDisplayed( driver, By.css( '.wp-block-cover' ) );
		} );

		step( 'Cover text matches published cover text', async function () {
			await ViewPostPage.Expect( driver );
			const publishedCoverTitle = await driver
				.findElement( By.css( '.wp-block-cover__inner-container' ) )
				.getText();

			assert.strictEqual(
				publishedCoverTitle,
				coverTitle,
				'Cover text did not match text in published post'
			);
		} );

		step( 'Image matches the image published', async function () {
			await ViewPostPage.Expect( driver );

			const coverElement = await driver.findElement( By.css( '.wp-block-cover' ) );
			const imgElement = await coverElement.findElement( By.xpath( '//img' ) );
			const imgPath = await imgElement.getAttribute( 'src' );

			// Parse off the path
			const imgFilename = imgPath.replace( /^.*[\\/]/, '' );

			// Only check image filename since alt text not currently set
			assert.strictEqual(
				imgFilename,
				fileDetails.fileName,
				'Image file did not match image in the published post'
			);
		} );

		after( async function () {
			if ( fileDetails ) {
				await mediaHelper.deleteFile( fileDetails );
			}
			await driverHelper.acceptAlertIfPresent( driver );
		} );
	} );
} );

// isElementPresent( driver, selector )
