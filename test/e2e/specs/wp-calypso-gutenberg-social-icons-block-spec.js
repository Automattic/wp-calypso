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

import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component';
import PostPreviewComponent from '../lib/components/post-preview-component';

import * as driverManager from '../lib/driver-manager';
import * as driverHelper from '../lib/driver-helper';
import * as dataHelper from '../lib/data-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser =
	process.env.GUTENBERG_EDGE === 'true' ? 'gutenbergSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

describe( `[${ host }] Calypso Gutenberg Editor: Social Icons Block (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );
	let driver;

	before( 'Start browser', async function () {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
	} );

	describe( 'Preview and Publish a Post with a Social Icons block', function () {
		const blogPostTitle = dataHelper.randomPhrase();

		step( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can enter post title', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.enterTitle( blogPostTitle );
		} );

		step( 'Can insert the Social Icons block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Social Links' );

			return await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.wp-block-social-links' )
			);
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
			return await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.wp-block-social-links' )
			);
		} );
	} );
} );
