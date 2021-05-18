/**
 * External dependencies
 */
import config from 'config';
import assert from 'assert';

/**
 * Internal dependencies
 */
import LoginFlow from '../../lib/flows/login-flow.js';

import NavBarComponent from '../../lib/components/nav-bar-component.js';
import SideBarComponent from '../../lib/components/sidebar-component';

import ImporterPage from '../../lib/pages/importer-page';

import * as driverManager from '../../lib/driver-manager.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

describe( 'Verify Import Option: (' + screenSize + ') @parallel', function () {
	this.timeout( mochaTimeOut );
	const driver = global.__BROWSER__;

	it( 'Can log in as default user', async function () {
		const loginFlow = new LoginFlow( driver );
		return await loginFlow.login();
	} );

	it( 'Can open the sidebar', async function () {
		const navBarComponent = await NavBarComponent.Expect( driver );
		await navBarComponent.clickMySites();
	} );

	it( "Following 'Import' menu option opens the Import page", async function () {
		const sideBarComponent = await SideBarComponent.Expect( driver );
		await sideBarComponent.selectImport();
		await ImporterPage.Expect( driver );
	} );

	it( 'Can see the WordPress importer', async function () {
		const importerPage = await ImporterPage.Expect( driver );
		assert( await importerPage.importerIsDisplayed( 'wordpress' ) );
	} );

	it( 'Can see the Medium importer', async function () {
		const importerPage = await ImporterPage.Expect( driver );
		assert( await importerPage.importerIsDisplayed( 'medium-logo' ) );
	} );

	it( 'Can see the Blogger importer', async function () {
		const importerPage = await ImporterPage.Expect( driver );
		assert( await importerPage.importerIsDisplayed( 'blogger-alt' ) );
	} );
} );
