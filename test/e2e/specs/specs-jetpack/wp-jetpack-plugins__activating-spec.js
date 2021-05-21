/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from '../../lib/driver-manager';
import { getJetpackHost } from '../../lib/data-helper';

import PluginsPage from '../../lib/pages/plugins-page';

import PluginDetailsPage from '../../lib/pages/plugin-details-page';
import LoginFlow from '../../lib/flows/login-flow';
import NoticesComponent from '../../lib/components/notices-component';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = getJetpackHost();

describe( `[${ host }] Jetpack Plugins - Activating a plugin: (${ screenSize }) @jetpack`, function () {
	this.timeout( mochaTimeOut );

	it( 'Can login and select Manage Plugins', async function () {
		await driverManager.clearCookiesAndDeleteLocalStorage( this.driver );

		const loginFlow = new LoginFlow( this.driver );
		await loginFlow.loginAndSelectManagePluginsJetpack();
	} );

	it( 'Can ensure Hello Dolly is deactivated', async function () {
		const pluginsPage = await PluginsPage.Expect( this.driver );
		await pluginsPage.viewPlugin( 'hello' );
		const pluginDetailsPage = await PluginDetailsPage.Expect( this.driver );
		await pluginDetailsPage.waitForPlugin();
		await pluginDetailsPage.ensureDeactivated();
		return await pluginDetailsPage.goBack();
	} );

	it( 'Can view the plugin details to activate Hello Dolly', async function () {
		const pluginsPage = await PluginsPage.Expect( this.driver );
		await pluginsPage.viewPlugin( 'hello' );
		const pluginDetailsPage = await PluginDetailsPage.Expect( this.driver );
		await pluginDetailsPage.waitForPlugin();
		return await pluginDetailsPage.clickActivateToggleForPlugin();
	} );

	it( 'Can see a success message contains Hello Dolly', async function () {
		const expectedPartialText = 'Successfully activated Hello Dolly';
		const noticesComponent = await NoticesComponent.Expect( this.driver );
		await noticesComponent.isSuccessNoticeDisplayed();
		const successMessageText = await noticesComponent.getNoticeContent();
		return assert.strictEqual(
			successMessageText.indexOf( expectedPartialText ) > -1,
			true,
			`The success message '${ successMessageText }' does not include '${ expectedPartialText }'`
		);
	} );
} );
