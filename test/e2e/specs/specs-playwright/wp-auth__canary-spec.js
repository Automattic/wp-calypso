/**
 * External dependencies
 */
import assert from 'assert';
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

	it( 'User agent is set', async function () {
		const userAgent = await this.page.evaluate( 'navigator.userAgent;' );
		assert( userAgent.match( 'wp-e2e-tests' ), `Unexpected user agent found: ${ userAgent }` );
	} );

	it( 'Can log in', async function () {
		const loginFlow = await new LoginFlow( this.page );
		await loginFlow.login();
	} );
} );
