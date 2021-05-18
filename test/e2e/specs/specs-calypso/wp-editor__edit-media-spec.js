/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../../lib/flows/login-flow.js';

import * as driverManager from '../../lib/driver-manager.js';
import * as dataHelper from '../../lib/data-helper';
import SideBarComponent from '../../lib/components/sidebar-component';
import MediaPage from '../../lib/pages/media-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Media: Edit Media (${ screenSize }) @parallel @jetpack`, function () {
	this.timeout( mochaTimeOut );
	const driver = global.__BROWSER__;

	before( 'Can login and select my site', async function () {
		const loginFlow = new LoginFlow( driver );
		await loginFlow.loginAndSelectMySite();
	} );

	it( "Select 'Media' option and see media content", async function () {
		const sideBarComponent = await SideBarComponent.Expect( driver );
		await sideBarComponent.selectMedia();
		return await MediaPage.Expect( driver );
	} );

	it( 'Select a random media item and click edit', async function () {
		const mediaPage = await MediaPage.Expect( driver );
		await mediaPage.selectFirstImage();
		await mediaPage.selectEditMedia();
		return await mediaPage.mediaEditorShowing();
	} );

	it( 'Click Edit Image', async function () {
		const mediaPage = await MediaPage.Expect( driver );
		await mediaPage.clickEditImage();
		return await mediaPage.imageShowingInEditor();
	} );
} );
