/**
 * External dependencies
 */
import config from 'config';
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';

import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component';

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

describe( `[${ host }] Calypso Gutenberg Editor: Social Icons Block (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );
	let driver;

	before( 'Start browser', async function () {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
	} );

	describe( 'Preview and Publish a Post with a Social Icons block', function () {
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

		step( 'Can insert the Social icons block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Social icons' );

			return await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.wp-block-social-icons' )
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
