/** @format */

import assert from 'assert';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper';

import SidebarComponent from '../lib/components/sidebar-component.js';
import SiteViewComponent from '../lib/components/site-view-component.js';
import LoginFlow from '../lib/flows/login-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] View site from sidebar: (${ screenSize }) @parallel @jetpack`, function() {
	this.timeout( mochaTimeOut );
	describe( 'View site and close:', function() {
		step( 'Can Log In and go to My Sites', async function() {
			const loginFlow = new LoginFlow( driver );
			return await loginFlow.loginAndSelectMySite();
		} );

		step( 'Can view the default site from sidebar', async function() {
			this.sidebarComponent = await SidebarComponent.Expect( driver );
			return await this.sidebarComponent.selectViewThisSite();
		} );

		step( 'Can see the web preview button', async function() {
			this.siteViewComponent = await SiteViewComponent.Expect( driver );
			let present = await this.siteViewComponent.isWebPreviewPresent();
			return assert.strictEqual( present, true, 'The web preview button was not displayed' );
		} );

		step( 'Can see the web preview "open in new window" button', async function() {
			let present = await this.siteViewComponent.isOpenInNewWindowButtonPresent();
			return assert.strictEqual(
				present,
				true,
				'The web preview "open in new window" button was not displayed'
			);
		} );

		step( 'Can see the site preview', async function() {
			let present = await this.siteViewComponent.isSitePresent();
			return assert.strictEqual( present, true, 'The web site preview was not displayed' );
		} );

		if ( screenSize !== 'mobile' ) {
			step( 'Can see the Search & Social preview', async function() {
				await this.siteViewComponent.selectSearchAndSocialPreview();
			} );
		}

		if ( screenSize === 'mobile' ) {
			step( 'Can close site view', async function() {
				return await this.siteViewComponent.close( driver );
			} );

			step( 'Can see sidebar again', async function() {
				let displayed = await this.sidebarComponent.displayed();
				return assert( displayed, 'The sidebar was not displayed' );
			} );
		}
	} );
} );
