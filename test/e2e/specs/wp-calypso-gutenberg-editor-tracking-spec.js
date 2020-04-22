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
import GutenbergEditorSidebarComponent from '../lib/gutenberg/gutenberg-editor-sidebar-component';
import WPAdminDashboardPage from '../lib/pages/wp-admin/wp-admin-dashboard-page';

import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';
import * as driverHelper from '../lib/driver-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser =
	process.env.GUTENBERG_EDGE === 'true' ? 'gutenbergSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Calypso Gutenberg Tracking: (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Tracking: @parallel', function () {
		let fileDetails;
		const pageTitle = dataHelper.randomPhrase();
		const pageQuote =
			'If you have the same problem for a long time, maybe it’s not a problem. Maybe it’s a fact..\n— Itzhak Rabin';

		// Create image file for upload
		before( async function () {} );

		step( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			if ( host !== 'WPCOM' ) {
				this.loginFlow = new LoginFlow( driver );
			}
			await this.loginFlow.loginAndSelectWPAdmin();

			//Wait for the new window or tab
			await driver.wait( async () => ( await driver.getAllWindowHandles() ).length === 2, 10000 );

			//Loop through until we find a new window handle
			const windows = await driver.getAllWindowHandles();

			await driver.switchTo().window( windows[ 1 ] );

			await driverHelper.clickWhenClickable( driver, By.css( '#menu-pages > a' ) ); //

			await driver.sleep( 5000 );
		} );

		// step( 'Can enter page title, content and image', async function () {

		// 	// const gEditorComponent = await GutenbergEditorComponent.Expect( driver );

		// 	// await driver.executeScript(
		// 	// 	`window.localStorage.setItem( 'debug', 'wpcom-block-editor*' );`
		// 	// );

		// 	// const debugConfig = await driver.executeScript(
		// 	// 	`return window.localStorage.getItem('debug');`
		// 	// );

		// 	// console.log( 'Using Tracks debug: ' + debugConfig );

		// 	// await gEditorComponent.enterTitle( pageTitle );
		// 	// await gEditorComponent.enterText( pageQuote );
		// 	// await gEditorComponent.addBlock( 'Columns' );

		// 	// await driver.sleep( 50000 );
		// 	// const logs = await driver.manage().logs().get( 'browser' );

		// 	// console.log( logs );
		// 	// driver.quit();
		// } );

		after( async function () {} );
	} );
} );
