/**
 * External dependencies
 */
import config from 'config';
import { DataHelper, BrowserHelper, LoginFlow } from '@automattic/calypso-e2e';

/**
 * Constants
 */
const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const host = DataHelper.getJetpackHost();
const viewportName = BrowserHelper.getViewportName();

describe( `[${ host }] Authentication: (${ viewportName }) @canary @parallel @safaricanary`, function () {
	this.timeout( mochaTimeOut );

	it( 'Can log in', async function () {
		const loginFlow = new LoginFlow( this.page );
		await loginFlow.login();
	} );
} );
