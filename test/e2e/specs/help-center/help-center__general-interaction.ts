/**
 * @group calypso-pr
 */

import {
	DataHelper,
	HelpCenterComponent,
	HelpCenterTestEnvironment,
	TestAccount,
	envVariables,
} from '@automattic/calypso-e2e';
import { Browser, Page, Locator } from 'playwright';
import { skipDescribeIf } from '../../jest-helpers';

declare const browser: Browser;

skipDescribeIf( envVariables.VIEWPORT_NAME === 'mobile' )( 'Help Center', () => {
	let page: Page;
	let testAccount: TestAccount;
	let helpCenterComponent: HelpCenterComponent;
	let helpCenterLocator: Locator;

	// Setup the page and test account
	beforeAll( async function () {
		page = await browser.newPage();

		testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page, { waitUntilStable: true } );
	} );

	// Close the page after the tests
	afterAll( async function () {
		await page.close();
	} );

	/**
	 * Run tests for both Calypso and Editor environments.
	 *
	 * WP-ADMIN environment is skipped because it loads the Help Center
	 * from widgets.wp.com therefore these tests are not applicable.
	 */
	describe.each< { component: HelpCenterTestEnvironment } >( [
		{ component: 'calypso' },
		{ component: 'editor' },
	] )( 'in $component', ( { component }: { component: HelpCenterTestEnvironment } ) => {
		beforeAll( async () => {
			helpCenterComponent = new HelpCenterComponent( page, component );
			helpCenterLocator = helpCenterComponent.getHelpCenterLocator();
		} );

		/**
		 * General Interaction
		 *
		 * These tests check the general interaction with the Help Center popover.
		 */
		describe( 'General Interaction', () => {
			it( 'is initially closed', async () => {
				if ( component === 'editor' ) {
					const postUrl = DataHelper.getCalypsoURL(
						'/post/' + testAccount.getSiteURL( { protocol: false } )
					);
					await page.goto( postUrl );
				}

				expect( await helpCenterLocator.isVisible() ).toBeFalsy();
			} );

			it( 'can be opened', async () => {
				await helpCenterComponent.openPopover();

				expect( await helpCenterLocator.isVisible() ).toBeTruthy();
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

				expect( await helpCenterLocator.isVisible() ).toBeFalsy();
			} );
		} );

		/**
		 * Articles
		 *
		 * These tests check the search function and article navigation.
		 */
		describe( 'Articles', () => {
			beforeAll( async () => {
				await helpCenterComponent.openPopover();
			} );

			afterAll( async () => {
				await helpCenterComponent.closePopover();
			} );

			it( 'initial articles are shown', async () => {
				const articles = helpCenterComponent.getArticles();
				const articleCount = await articles.count();
				expect( articleCount ).toBeGreaterThanOrEqual( 5 );
			} );

			it( 'search returns proper results', async () => {
				await helpCenterComponent.search( 'change my domain' );
				const searchResults = helpCenterComponent.getArticles();
				const resultTitles = await searchResults.allTextContents();
				expect(
					resultTitles.some( ( title ) =>
						title.replace( /\s+/g, ' ' ).trim().includes( 'Change a Domain Name Address' )
					)
				).toBeTruthy();
			} );

			it( 'post loads correctly', async () => {
				const articles = helpCenterComponent.getArticles();
				await articles.first().click();

				const articleContent = helpCenterComponent.getArticleContent();

				expect( await articleContent.isVisible() ).toBeTruthy();
			} );
		} );

		/**
		 * Support Flow
		 *
		 * These tests check the support flow. Starting with AI and then chat.
		 */
		describe( 'Support Flow', () => {
			beforeAll( async () => {
				await helpCenterComponent.openPopover();
			} );

			afterAll( async () => {
				await helpCenterComponent.closePopover();
			} );

			it( 'AI chat starts correctly', async () => {
				const stillNeedHelp = helpCenterLocator.locator( 'a.help-center-contact-page__button' );
				await stillNeedHelp.click();

				const firstAiChatMessage = await helpCenterLocator
					.locator( '.odie-chatbox-introduction-message' )
					.textContent();

				expect(
					firstAiChatMessage &&
						firstAiChatMessage.includes( 'Tell me all about it and I’ll be happy to help' )
				).toBeTruthy();
			} );

			it( 'AI responds and forwards to human agent', async () => {
				await helpCenterComponent.startAIChat( 'talk to human' );

				const contactSupportButton = await helpCenterComponent.getContactSupportButton();

				expect( contactSupportButton.isVisible() ).toBeTruthy();
			} );

			it( 'Contact Support button opens Zendesk', async () => {
				const contactSupportButton = helpCenterComponent.getContactSupportButton();
				await contactSupportButton.click();

				const zendeskWindow = await page.getByRole( 'dialog', { name: 'Messaging window' } );

				expect( zendeskWindow.isVisible() ).toBeTruthy();
			} );
		} );
	} );

	/**
	 * Action Hooks
	 *
	 * These tests Help Center opening on page load.
	 */
	describe( 'via action hooks', () => {
		beforeAll( async () => {
			helpCenterComponent = new HelpCenterComponent( page, 'calypso' );
			helpCenterLocator = helpCenterComponent.getHelpCenterLocator();
		} );

		it( 'opened on page load', async () => {
			const postUrl = DataHelper.getCalypsoURL(
				'/home/' + testAccount.getSiteURL( { protocol: false } ),
				{
					'help-center': 'home',
				}
			);

			await page.goto( postUrl );

			await helpCenterLocator.waitFor( { state: 'visible' } );

			expect( await helpCenterComponent.isPopoverShown() ).toBeTruthy();
		} );

		it( 'open Wapuu on page load', async () => {
			const postUrl = DataHelper.getCalypsoURL(
				'/home/' + testAccount.getSiteURL( { protocol: false } ),
				{
					'help-center': 'wapuu',
				}
			);

			await page.goto( postUrl );
			await helpCenterLocator.waitFor( { state: 'visible' } );

			expect( await helpCenterComponent.isPopoverShown() ).toBeTruthy();

			const firstAiChatMessage = await helpCenterLocator
				.locator( '.odie-chatbox-introduction-message' )
				.textContent();

			expect(
				firstAiChatMessage &&
					firstAiChatMessage.includes( 'Tell me all about it and I’ll be happy to help' )
			).toBeTruthy();
		} );
	} );
} );
