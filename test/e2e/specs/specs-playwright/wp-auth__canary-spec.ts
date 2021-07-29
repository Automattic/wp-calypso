import { DataHelper, BrowserHelper, LoginFlow, setupHooks } from '@automattic/calypso-e2e';
import { Page } from 'playwright';

/**
 * Constants
 */
const host = DataHelper.getJetpackHost();
const viewportName = BrowserHelper.getViewportName();

describe( `[${ host }] Authentication: (${ viewportName }) @canary @parallel @safaricanary`, function () {
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( 'Can log in', async function () {
		const loginFlow = new LoginFlow( page );
		await loginFlow.logIn();
	} );
} );
