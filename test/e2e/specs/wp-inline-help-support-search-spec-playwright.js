/**
 * External dependencies
 */
import playwright from 'playwright';
import config from 'config';

/**
 * Internal dependencies
 */
import * as dataHelper from '../lib/data-helper';
import * as driverManager from '../lib/driver-manager';

import LoginFlow from '../lib/flows/login-flow-playwright.js';

import SidebarComponent from '../lib/components/sidebar-component-playwright.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser = 'gutenbergSimpleSiteUser';

let browser;
let context;

before( async function () {
	browser = await playwright.chromium.launch( { headless: false, devtools: false } );
	context = await browser.newContext();
} );

describe( `[${ host }] Inline Help: (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );
	let page;

	it( `Login and select Settings`, async function () {
		this.LoginFlow = new LoginFlow( context, gutenbergUser );
		page = await this.LoginFlow.loginAndSelectSettings();
		this.sidebarComponent = new SidebarComponent( page );
		return await this.sidebarComponent._init();
	} );
} );

after( async function () {
	await browser.close();
} );
