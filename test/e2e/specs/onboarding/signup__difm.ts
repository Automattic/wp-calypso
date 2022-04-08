/**
 * @group calypso-pr
 */

import { DataHelper, DIFMFlow, TestAccount } from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Do it for me' ), () => {
	let page: Page;
	let difmFlow: DIFMFlow;

	beforeAll( async () => {
		page = await browser.newPage();
		difmFlow = new DIFMFlow( page );

		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );
	} );

	/**
	 * Navigate to initial setup page.
	 */
	const navigateToLanding = () => {
		it( `Navigate to Setup page`, async () => {
			await difmFlow.startSetup();
			await difmFlow.validateOptionsPage();
		} );
	};

	describe( 'Follow the WordPress import flow', () => {
		navigateToLanding();

		it( 'Start a WordPress import', async () => {
			await difmFlow.enterOptions( 'Test Site', 'Just a little test' );
			await difmFlow.validateSocialPage();
		} );
	} );
} );
