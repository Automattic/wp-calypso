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
		it( `Navigate to landing page`, async () => {
			await difmFlow.startSetup();
			await difmFlow.validateSetupPage();
		} );
	};

	describe( 'Follow the default DIFM order flow', () => {
		navigateToLanding();

		it( 'Start a DIFM order for a new site', async () => {
			await difmFlow.clickButton( 'start a new site' );
			await difmFlow.validateOptionsPage();
		} );

		it( 'Enter relevant information', async () => {
			await difmFlow.enterOptions( 'Test Site', 'Just a little test' );
			await difmFlow.clickButton( 'Continue' );
			await difmFlow.validateSocialPage();
		} );

		it( 'Skip the social page', async () => {
			await difmFlow.clickButton( 'Skip' );
			await difmFlow.validateDesignPage();
		} );

		it( 'Let the team chose the layout', async () => {
			await difmFlow.clickButton( 'Let us choose' );
			await difmFlow.validatePagePickerPage();
		} );

		it( 'Proceed to Checkout', async () => {
			await difmFlow.clickButton( 'Go to Checkout' );
			await difmFlow.validateCheckoutPage();
		} );
	} );
} );
