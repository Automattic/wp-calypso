/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../../../lib/flows/login-flow.js';

import SidebarComponent from '../../../lib/components/sidebar-component.js';
import SiteEditorPage from '../../../lib/pages/site-editor-page.js';
import SiteEditorComponent from '../../../lib/components/site-editor-component.js';

import * as driverManager from '../../../lib/driver-manager.js';
import * as dataHelper from '../../../lib/data-helper.js';
import { clearEventsStack } from '../../lib/gutenberg/tracking/utils.js';
import { createGeneralTests } from '../../lib/gutenberg/tracking/general-tests.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

const siteEditorUser = 'siteEditorSimpleSiteUser';

describe( `[${ host }] Calypso Gutenberg Site Editor Tracking: (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Tracking Site Editor: @parallel', function () {
		it( 'Log in with site editor user and Site Editor opens successfully', async function () {
			const loginFlow = new LoginFlow( this.driver, siteEditorUser );
			await loginFlow.loginAndSelectMySite();

			const sidebarComponent = await SidebarComponent.Expect( this.driver );
			await sidebarComponent.selectSiteEditor();
			await SiteEditorPage.Expect( this.driver );

			const editor = await SiteEditorComponent.Expect( this.driver );
			await editor.waitForTemplateToLoad();
			await editor.waitForTemplatePartsToLoad();
		} );

		createGeneralTests( { it, editorType: 'site' } );

		afterEach( clearEventsStack );
	} );
} );
