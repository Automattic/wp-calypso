/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';

import NavBarComponent from '../lib/components/nav-bar-component.js';
import SidebarComponent from '../lib/components/sidebar-component.js';

import StatsPage from '../lib/pages/stats-page.js';

import * as driverManager from '../lib/driver-manager.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

describe( 'Stats: (' + screenSize + ') @parallel', function () {
	this.timeout( mochaTimeOut );
	let driver;

	before( async function () {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
	} );

	describe( 'Can navigate to the stats insights page', function () {
		step( 'Can log in', async function () {
			const loginFlow = new LoginFlow( driver );
			await loginFlow.login();
		} );

		step( 'Can open the sidebar', async function () {
			const navBarComponent = await NavBarComponent.Expect( driver );
			await navBarComponent.clickMySites();
		} );

		step( 'Can open the stats insights page', async function () {
			const sidebarComponent = await SidebarComponent.Expect( driver );
			await sidebarComponent.selectStats();
			const statsPage = await StatsPage.Expect( driver );
			await statsPage.openInsights();
		} );
	} );
} );
