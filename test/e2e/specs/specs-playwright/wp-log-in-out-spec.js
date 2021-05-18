/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import { LoginFlow } from '@automattic/calypso-e2e';

/**
 * Constants
 */
const mochaTimeOut = config.get( 'mochaTimeoutMS' );

describe( `Auth Screen Canary: @parallel`, function () {
	this.timeout( mochaTimeOut );

	before( 'Can log in', async function () {
		const loginFlow = await new LoginFlow( this.page );
		await loginFlow.login();
	} );

	it( 'Some dummy step', async function () {
		await this.page.waitForSelector( '#wpcom' );
	} );
} );
