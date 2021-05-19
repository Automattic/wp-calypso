/**
 * External dependencies
 */
import config from 'config';
import { DataHelper, BrowserHelper } from '@automattic/calypso-e2e';

/**
 * Internal dependencies
 */
import { LoginFlow } from '@automattic/calypso-e2e';

/**
 * Constants
 */
const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const host = DataHelper.getJetpackHost();
const viewportName = BrowserHelper.getViewportName();

describe( `[${ host }] Auth Screen Canary: (${ viewportName }) @parallel @safaricanary`, function () {
	this.timeout( mochaTimeOut );

	it( 'Can log in', async function () {
		const loginFlow = await new LoginFlow( this.page );
		await loginFlow.login();
	} );
} );
