/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../../lib/flows/login-flow.js';
import * as driverManager from '../../lib/driver-manager';
import * as dataHelper from '../../lib/data-helper';
import SidebarComponent from '../../lib/components/sidebar-component.js';
import SiteEditorPage from '../../lib/pages/site-editor-page.js';
import SiteEditorComponent from '../../lib/components/site-editor-component';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser = 'siteEditorSimpleSiteUser';

describe( `[${ host }] Site Editor (${ screenSize }) @parallel`, function () {
	this.timeout( mochaTimeOut );

	it( 'Can log in', async function () {
		this.loginFlow = new LoginFlow( this.driver, gutenbergUser );
		return await this.loginFlow.loginAndSelectMySite();
	} );

	it( 'Can open site editor', async function () {
		const sidebarComponent = await SidebarComponent.Expect( this.driver );
		return await sidebarComponent.selectSiteEditor();
	} );

	it( 'Site editor opens', async function () {
		return await SiteEditorPage.Expect( this.driver );
	} );

	it( 'Template loads', async function () {
		const editor = await SiteEditorComponent.Expect( this.driver );
		return await editor.waitForTemplateToLoad();
	} );

	it( 'Template parts load', async function () {
		const editor = await SiteEditorComponent.Expect( this.driver );
		return await editor.waitForTemplatePartsToLoad();
	} );

	after( async () => {
		return await this.driver.switchTo().defaultContent();
	} );
} );
