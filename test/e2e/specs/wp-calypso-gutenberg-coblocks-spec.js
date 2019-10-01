/** @format */

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

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Calypso Gutenberg Editor: CoBlocks (${ screenSize })`, function() {
	this.timeout( mochaTimeOut );

	describe( 'Insert a Buttons block: @parallel', function() {
		step( 'Can log in', async function() {
			this.loginFlow = new LoginFlow( driver, 'gutenbergSimpleSiteUser' );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can insert the Buttons block', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Buttons' );
			return await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.wp-block-coblocks-buttons' )
			);
		} );

		step( 'Can publish and view content', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		step( 'Can see the Buttons block in our published post', async function() {
			return await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.wp-block-coblocks-buttons' )
			);
		} );
	} );

	// describe( 'Insert a Click to Tweet block: @parallel', function() {
	// 	step( 'Can log in', async function() {
	// 		this.loginFlow = new LoginFlow( driver, 'gutenbergSimpleSiteUser' );
	// 		return await this.loginFlow.loginAndStartNewPost( null, true );
	// 	} );

	// 	step( 'Can insert the Click to Tweet block', async function() {
	// 		const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
	// 		await gEditorComponent.addBlock( 'Click to Tweet' );
	//         return await driverHelper.waitTillPresentAndDisplayed(
	//             driver,
	//             By.css( '.wp-block-coblocks-click-to-tweet' )
	//         );
	// 	} );

	// 	step( 'Can publish and view content', async function() {
	// 		const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
	// 		return await gEditorComponent.publish( { visit: true } );
	// 	} );

	// 	step( 'Can see the Click to Tweet block in our published post', async function() {
	//         return await driverHelper.waitTillPresentAndDisplayed(
	//             driver,
	//             By.css( '.wp-block-coblocks-click-to-tweet' )
	//         );
	// 	} );
	// } );

	describe( 'Insert a Dynamic HR block: @parallel', function() {
		step( 'Can log in', async function() {
			this.loginFlow = new LoginFlow( driver, 'gutenbergSimpleSiteUser' );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can insert the Dynamic HR block', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Dynamic HR' );
			return await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.wp-block-coblocks-dynamic-separator' )
			);
		} );

		step( 'Can publish and view content', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		step( 'Can see the Dynamic HR block in our published post', async function() {
			return await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.wp-block-coblocks-dynamic-separator' )
			);
		} );
	} );

	describe( 'Insert a Hero block: @parallel', function() {
		step( 'Can log in', async function() {
			this.loginFlow = new LoginFlow( driver, 'gutenbergSimpleSiteUser' );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can insert the Hero block', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Hero' );
			return await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.wp-block-coblocks-hero' )
			);
		} );

		step( 'Can publish and view content', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		step( 'Can see the Hero block in our published post', async function() {
			return await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.wp-block-coblocks-hero' )
			);
		} );
	} );

	// describe( 'Insert a Logos & Badges block: @parallel', function() {
	// 	step( 'Can log in', async function() {
	// 		this.loginFlow = new LoginFlow( driver, 'gutenbergSimpleSiteUser' );
	// 		return await this.loginFlow.loginAndStartNewPost( null, true );
	// 	} );

	// 	step( 'Can insert the Logos & Badges block', async function() {
	// 		const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
	// 		await gEditorComponent.addBlock( 'Logos' );
	//         return await driverHelper.waitTillPresentAndDisplayed(
	//             driver,
	//             By.css( '.wp-block-coblocks-logos' )
	//         );
	// 	} );

	// 	step( 'Can publish and view content', async function() {
	// 		const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
	// 		return await gEditorComponent.publish( { visit: true } );
	// 	} );

	// 	step( 'Can see the Logos & Badges block in our published post', async function() {
	//         return await driverHelper.waitTillPresentAndDisplayed(
	//             driver,
	//             By.css( '.wp-block-coblocks-logos' )
	//         );
	// 	} );
	// } );

	describe( 'Insert a Pricing Table block: @parallel', function() {
		step( 'Can log in', async function() {
			this.loginFlow = new LoginFlow( driver, 'gutenbergSimpleSiteUser' );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can insert the Pricing Table block', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Pricing Table' );
			return await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.wp-block-coblocks-pricing-table' )
			);
		} );

		step( 'Can publish and view content', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		step( 'Can see the Pricing Table block in our published post', async function() {
			return await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.wp-block-coblocks-pricing-table' )
			);
		} );
	} );
} );
