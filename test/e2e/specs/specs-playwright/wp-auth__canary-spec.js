/**
 * External dependencies
 */
import { DataHelper, BrowserHelper, LoginFlow } from '@automattic/calypso-e2e';

/**
 * Constants
 */
// const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const host = DataHelper.getJetpackHost();
const viewportName = BrowserHelper.getViewportName();

describe( `[${ host }] Authentication: (${ viewportName }) @canary @parallel @safaricanary`, function () {
	it( 'Can log in', async function () {
		await page.click( 'lwerpoiweuriowerpu' );
		const loginFlow = new LoginFlow( page );
		await loginFlow.login();
	} );
} );
