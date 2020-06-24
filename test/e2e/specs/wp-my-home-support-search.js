/**
 * External dependencies
 */
import config from 'config';
import assert from 'assert';

/**
 * Internal dependencies
 */
import * as driverManager from '../lib/driver-manager.js';

import LoginFlow from '../lib/flows/login-flow.js';
import * as dataHelper from '../lib/data-helper';
import InlineHelpPopoverComponent from '../lib/components/inline-help-popover-component';
import SupportSearchComponent from '../lib/components/support-search-component';
import SidebarComponent from '../lib/components/sidebar-component';
const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;
let supportSearchComponent;
let inlineHelpPopoverComponent;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Accessing support search: (${ screenSize })`, async function () {
	this.timeout( mochaTimeOut );

	describe( 'My Home "Get help" support search card', function () {
		step( 'Login and select a non My Home page', async function () {
			const loginFlow = new LoginFlow( driver );

			// The "inline help" FAB should not appear on the My Home
			// because there is already a support search "Card" on that
			// page. Therefore we select the "Themes" page for our tests
			// and then we will switch away to the Homepage to verify
			// that the Inline Help is not shown
			await loginFlow.loginAndSelectThemes();

			// Initialize the helper component for the Inline Popover
			inlineHelpPopoverComponent = await InlineHelpPopoverComponent.Expect( driver );

			// Check the InlineHelp toggle is actually visible in the first instance...
			const isToggleVisible = await inlineHelpPopoverComponent.isToggleVisible();
			assert.equal(
				isToggleVisible,
				true,
				'Inline Help support search was not displayed on a non My Home page.'
			);
		} );

		step( 'Select the My Home page', async function () {
			const sidebarComponent = await SidebarComponent.Expect( driver );
			await sidebarComponent.selectMyHome();
		} );

		step( 'Verify Inline Help support search is not displayed on My Home', async function () {
			// The toggle only hides once the "Get help" card is rendered so
			// we need to give it a little time to be removed.
			await inlineHelpPopoverComponent.waitForToggleNotToBePresent();

			// Once removed we can assert is is invisible.
			const isToggleVisible = await inlineHelpPopoverComponent.isToggleVisible();
			assert.equal(
				isToggleVisible,
				false,
				'Inline Help support search was not correctly hidden on Home page.'
			);
		} );
	} );
} );
