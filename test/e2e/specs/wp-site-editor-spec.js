/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';
import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';
import SidebarComponent from '../lib/components/sidebar-component.js';
import SiteEditorPage from '../lib/pages/site-editor-page.js';
import SiteEditorComponent from '../lib/components/site-editor-component';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser = 'siteEditorSimpleSiteUser';

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Site Editor (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	step( 'Can log in', async function () {
		this.loginFlow = new LoginFlow( driver, gutenbergUser );
		return await this.loginFlow.loginAndSelectMySite();
	} );

	step( 'Can open site editor', async function () {
		const sidebarComponent = await SidebarComponent.Expect( driver );
		return await sidebarComponent.selectSiteEditor();
	} );

	step( 'Site editor opens', async function () {
		return await SiteEditorPage.Expect( driver );
	} );

	step( 'Template loads', async function () {
		const editor = await SiteEditorComponent.Expect( driver );
		return await editor.waitForTemplateToLoad();
	} );

	step( 'Template parts load', async function () {
		const editor = await SiteEditorComponent.Expect( driver );
		return await editor.waitForTemplatePartsToLoad();
	} );

	after( async () => {
		return await driver.switchTo().defaultContent();
	} );
} );
