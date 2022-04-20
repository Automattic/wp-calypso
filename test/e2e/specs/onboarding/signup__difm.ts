/**
 * @group calypso-pr
 */

import { DataHelper, DIFMFlow, CartCheckoutPage, TestAccount } from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Do it for me' ), () => {
	let page: Page;
	let difmFlow: DIFMFlow;
	let cart: CartCheckoutPage;

	beforeAll( async () => {
		page = await browser.newPage();
		difmFlow = new DIFMFlow( page );
		cart = new CartCheckoutPage( page );

		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );
	} );

	/**
	 * Navigate to initial setup page.
	 */
	const navigateToLanding = () => {
		it( `Navigate to landing page`, async () => {
			await difmFlow.visitSetup();
			await difmFlow.validateStartPage();
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

		it( 'Fill out the social page', async () => {
			await difmFlow.enterSocial( { twitter: 'https://twitter.com/automattic' } );
			await difmFlow.clickButton( 'Continue' );
			await difmFlow.validateDesignPage();
		} );

		it( 'Choose one of the free designs', async () => {
			await difmFlow.chooseFreeDesign();
			await difmFlow.validatePagePickerPage();
		} );

		it( 'Select multiple new pages', async () => {
			await difmFlow.selectPage( 'Blog' );
			await difmFlow.selectPage( 'Services' );
		} );

		it( 'Proceed to Checkout', async () => {
			await difmFlow.clickButton( 'Go to Checkout' );
			await difmFlow.validateCheckoutPage();
			await cart.validateCartItem( 'Do It For Me' );
		} );
	} );

	describe( 'Use existing page for DIFM', () => {
		navigateToLanding();

		it( 'Start a DIFM order for an existing site', async () => {
			await difmFlow.clickButton( 'Select a site' );
			await difmFlow.validateUseExistingPage();
		} );

		it( 'Search and select an existing site', async () => {
			await difmFlow.searchForSite( 'Test Site' );
			await difmFlow.selectSite( 'Test Site' );
			await difmFlow.validateConfirmationBox();
		} );

		it( 'Confirm and delete existing site', async () => {
			await difmFlow.confirmDeletion();
			await difmFlow.clickButton( 'Delete site content' );
			await difmFlow.validateOptionsPage();
		} );
	} );
} );
