import { expect, tags, test } from '../../lib/pw-base';

test.describe( 'Help Center in Calypso', { tag: [ tags.CALYPSO_PR, tags.DESKTOP_ONLY ] }, () => {
	const normalizeString = ( str: string | null ) => str?.replace( /\s+/g, ' ' ).trim();

	test.beforeEach( async ( { accountDefaultUser, componentHelpCenter, page } ) => {
		await test.step( 'Given I am authenticated', async function () {
			await accountDefaultUser.authenticate( page, { waitUntilStable: true } );
		} );

		await test.step( 'And I set Zendesk to staging environment', async function () {
			await componentHelpCenter.setZendeskStaging();
		} );

		await test.step( 'And I force Odie to Test mode', async function () {
			await componentHelpCenter.setOdieTestMode();
		} );
	} );

	test.describe( 'General Interaction', () => {
		test( 'As a user, I can interact with the Help Center popover', async ( {
			componentHelpCenter,
			page,
		} ) => {
			const helpCenterLocator = componentHelpCenter.getHelpCenterLocator();

			await test.step( 'Then the Help Center is initially closed', async function () {
				expect( await componentHelpCenter.isVisible() ).toBeFalsy();
			} );

			await test.step( 'When I open the Help Center', async function () {
				await componentHelpCenter.openPopover();
			} );

			await test.step( 'Then the Help Center is visible', async function () {
				expect( await componentHelpCenter.isVisible() ).toBeTruthy();
			} );

			await test.step( 'And the popover is showing on the screen', async function () {
				expect( await componentHelpCenter.isPopoverShown() ).toBeTruthy();
			} );

			await test.step( 'When I minimize the popover', async function () {
				await componentHelpCenter.minimizePopover();
			} );

			await test.step( 'Then the popover is minimized', async function () {
				// Wait for the transition to complete.
				await page.waitForTimeout( 200 );

				const containerHeight = await helpCenterLocator.evaluate(
					( el: HTMLElement ) => el.offsetHeight
				);

				expect( containerHeight ).toBe( 56 );
			} );

			await test.step( 'When I maximize the popover', async function () {
				await componentHelpCenter.maximizePopover();
			} );

			await test.step( 'Then the popover is showing on the screen', async function () {
				expect( await componentHelpCenter.isPopoverShown() ).toBeTruthy();
			} );
		} );
	} );

	test.describe( 'Articles', () => {
		test( 'As a user, I can search and view articles', async ( { componentHelpCenter, page } ) => {
			const helpCenterLocator = componentHelpCenter.getHelpCenterLocator();

			await test.step( 'Given the Help Center is open', async function () {
				await componentHelpCenter.openPopover();
			} );

			await test.step( 'Then initial articles are shown', async function () {
				const articles = componentHelpCenter.getArticles();
				await expect.poll( async () => await articles.count() ).toBeGreaterThanOrEqual( 1 );
			} );

			await test.step( 'When I search for a specific topic', async function () {
				await componentHelpCenter.search( 'Change a domain name address' );
			} );

			await test.step( 'Then search returns proper results', async function () {
				const resultTitles = await componentHelpCenter.getArticles().allTextContents();

				expect(
					resultTitles.some(
						( title ) => normalizeString( title )?.includes( 'Change a domain name address' )
					)
				).toBeTruthy();
			} );

			await test.step( 'When I click on an article', async function () {
				const article = await componentHelpCenter.getArticles().first();
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
			} );

			await test.step( 'When I navigate back', async function () {
				await componentHelpCenter.goBack();
			} );

			await test.step( 'When I close the popover', async function () {
				await componentHelpCenter.closePopover();
			} );

			await test.step( 'Then the Help Center is closed', async function () {
				expect( await componentHelpCenter.isVisible() ).toBeFalsy();
			} );
		} );
	} );

	test.describe( 'Action Hooks', () => {
		test( 'As a user, I can open Help Center via URL parameter', async ( {
			accountDefaultUser,
			componentHelpCenter,
			helperData,
			page,
		} ) => {
			const helpCenterLocator = componentHelpCenter.getHelpCenterLocator();

			await test.step( 'When I visit home page with help-center=home parameter', async function () {
				await page.goto(
					helperData.getCalypsoURL(
						'/home/' + accountDefaultUser.getSiteURL( { protocol: false } ),
						{
							'help-center': 'home',
						}
					)
				);
			} );

			await test.step( 'Then the Help Center opens automatically', async function () {
				await helpCenterLocator.waitFor( { state: 'visible' } );
				expect( await componentHelpCenter.isPopoverShown() ).toBeTruthy();
			} );
		} );

		test( 'As a user, I can open Help Center to Wapuu via URL parameter', async ( {
			accountDefaultUser,
			componentHelpCenter,
			helperData,
			page,
		} ) => {
			const helpCenterLocator = componentHelpCenter.getHelpCenterLocator();

			await test.step( 'When I visit home page with help-center=wapuu parameter', async function () {
				await page.goto(
					helperData.getCalypsoURL(
						'/home/' + accountDefaultUser.getSiteURL( { protocol: false } ),
						{
							'help-center': 'wapuu',
						}
					)
				);
			} );

			await test.step( 'Then the Help Center opens automatically to Wapuu', async function () {
				await helpCenterLocator.waitFor( { state: 'visible' } );
				expect( await componentHelpCenter.isPopoverShown() ).toBeTruthy();
				expect( await componentHelpCenter.getOdieChat().count() ).toBeTruthy();
			} );
		} );
	} );
} );
