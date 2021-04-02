/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';

import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper';
import SideBarComponent from '../lib/components/sidebar-component';
import MediaPage from '../lib/pages/media-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Media: Edit Media (${ screenSize }) @parallel @jetpack`, function () {
	this.timeout( mochaTimeOut );
	let driver;

	before( 'Start browser', async function () {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
	} );

	describe( 'Edit Existing Media:', function () {
		before( 'Can login and select my site', async function () {
			const loginFlow = new LoginFlow( driver );
			await loginFlow.loginAndSelectMySite();
		} );

		step( "Select 'Media' option and see media content", async function () {
			const sideBarComponent = await SideBarComponent.Expect( driver );
			await sideBarComponent.selectMedia();
			return await MediaPage.Expect( driver );
		} );

		step( 'Select a random media item and click edit', async function () {
			const mediaPage = await MediaPage.Expect( driver );
			await mediaPage.selectFirstImage();
			await mediaPage.selectEditMedia();
			return await mediaPage.mediaEditorShowing();
		} );

		step( 'Click Edit Image', async function () {
			const mediaPage = await MediaPage.Expect( driver );
			await mediaPage.clickEditImage();
			return await mediaPage.imageShowingInEditor();
		} );
	} );
} );
