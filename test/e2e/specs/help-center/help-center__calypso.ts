/**
 * @group calypso-pr
 */

import {
	DataHelper,
	HelpCenterComponent,
	TestAccount,
	envVariables,
} from '@automattic/calypso-e2e';
import { Browser, Page, Locator } from 'playwright';
import { skipDescribeIf } from '../../jest-helpers';

declare const browser: Browser;

skipDescribeIf( envVariables.VIEWPORT_NAME === 'mobile' )( 'Help Center in Calypso', () => {
	const normalizeString = ( str: string | null ) => str?.replace( /\s+/g, ' ' ).trim();

	let page: Page;
	let testAccount: TestAccount;
	let helpCenterComponent: HelpCenterComponent;
	let helpCenterLocator: Locator;

	// Setup the page and test account
	beforeAll( async function () {
		page = await browser.newPage();

		testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page, { waitUntilStable: true } );

		helpCenterComponent = new HelpCenterComponent( page );
		helpCenterLocator = helpCenterComponent.getHelpCenterLocator();

		// Set Zendesk to staging environment to prevent calling Zendesk API in test environment.
		await helpCenterComponent.setZendeskStaging();
	} );

	// Close the page after the tests
	afterAll( async function () {
		await page.close();
	} );

	/**
	 * General Interaction
	 *
	 * These tests check the general interaction with the Help Center popover.
	 */
	describe( 'General Interaction', () => {
		it( 'is initially closed', async () => {
			expect( await helpCenterComponent.isVisible() ).toBeFalsy();
		} );

		it( 'can be opened', async () => {
			await helpCenterComponent.openPopover();

			expect( await helpCenterComponent.isVisible() ).toBeTruthy();
		} );

		it( 'is showing on the screen', async () => {
			expect( await helpCenterComponent.isPopoverShown() ).toBeTruthy();
		} );

		it( 'can be minimized', async () => {
			await helpCenterComponent.minimizePopover();

			const containerHeight = await helpCenterLocator.evaluate(
				( el: HTMLElement ) => el.offsetHeight
			);

			expect( containerHeight ).toBe( 50 );
		} );

		it( 'the popover can be closed', async () => {
			await helpCenterComponent.closePopover();

			expect( await helpCenterComponent.isVisible() ).toBeFalsy();
		} );
	} );

	/**
	 * Articles
	 *
	 * These tests check the search function and article navigation.
	 */
	describe( 'Articles', () => {
		it( 'initial articles are shown', async () => {
			await helpCenterComponent.openPopover();

			const articles = helpCenterComponent.getArticles();

			expect( await articles.count() ).toBeGreaterThanOrEqual( 5 );
		} );

		it( 'search returns proper results', async () => {
			await helpCenterComponent.search( 'Change a Domain Name Address' );
			const resultTitles = await helpCenterComponent.getArticles().allTextContents();
			expect(
				resultTitles.some(
					( title ) => normalizeString( title )?.includes( 'Change a Domain Name Address' )
				)
			).toBeTruthy();
		} );

		it( 'post loads correctly', async () => {
			const article = await helpCenterComponent.getArticles().first();
			const articleTitle = await article.textContent();
			await article.click();

			// Make sure the API response is valid
			await page.waitForResponse(
				( response ) =>
					response.url().includes( '/wpcom/v2/help/article' ) && response.status() === 200
			);

			const articleHeader = await helpCenterLocator
				.getByRole( 'article' )
				.getByRole( 'heading' )
				.first();
			await articleHeader.waitFor( { state: 'visible' } );

			expect( normalizeString( await articleHeader.textContent() ) ).toBe(
				normalizeString( articleTitle )
			);

			await helpCenterComponent.goBack();
		} );
	} );

	/**
	 * Support Flow
	 *
	 * These tests check the support flow. Starting with AI and then chat.
	 */
	describe( 'Support Flow', () => {
		it( 'start support flow', async () => {
			await helpCenterComponent.openPopover();

			const stillNeedHelpButton = helpCenterLocator.getByRole( 'link', {
				name: 'Still need help?',
			} );

			await stillNeedHelpButton.waitFor( { state: 'visible' } );
			await stillNeedHelpButton.click();

			expect( await helpCenterLocator.locator( '#odie-messages-container' ).count() ).toBeTruthy();
		} );

		it( 'get forwarded to a human', async () => {
			await helpCenterComponent.startAIChat( 'talk to human' );

			const contactSupportButton = helpCenterComponent.getContactSupportButton();
			await contactSupportButton.waitFor( { state: 'visible' } );

			expect( await contactSupportButton.count() ).toBeTruthy();
		} );

		/**
		 * These tests need to be update
		 */
		it( 'start talking with a human', async () => {
			const contactSupportButton = await helpCenterComponent.getContactSupportButton();
			await contactSupportButton.dispatchEvent( 'click' );

			const zendeskMessaging = await page
				.frameLocator( 'iframe[title="Messaging window"]' )
				.getByPlaceholder( 'Type a message' );

			await zendeskMessaging.waitFor( { state: 'visible' } );

			expect( await zendeskMessaging.count() ).toBeTruthy();
		} );
	} );

	/**
	 * Action Hooks
	 *
	 * These tests Help Center opening on page load.
	 */
	describe( 'Action Hooks', () => {
		it( 'open help center on page load', async () => {
			await page.goto(
				DataHelper.getCalypsoURL( '/home/' + testAccount.getSiteURL( { protocol: false } ), {
					'help-center': 'home',
				} )
			);

			await helpCenterLocator.waitFor( { state: 'visible' } );

			expect( await helpCenterComponent.isPopoverShown() ).toBeTruthy();
		} );

		it( 'open help center to Wapuu on page load', async () => {
			await page.goto(
				DataHelper.getCalypsoURL( '/home/' + testAccount.getSiteURL( { protocol: false } ), {
					'help-center': 'wapuu',
				} )
			);

			await helpCenterLocator.waitFor( { state: 'visible' } );

			expect( await helpCenterComponent.isPopoverShown() ).toBeTruthy();
			expect( await helpCenterComponent.getOdieChat().count() ).toBeTruthy();
		} );
	} );
} );
