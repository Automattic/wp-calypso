/**
 * @group calypso-pr
 */

import {
	DataHelper,
	SupportComponent,
	TestAccount,
	TestAccountName,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

/** Tests to ensure the Help Center is open and visible in Calypso and the Editor */
describe.each( [ { accountName: 'defaultUser' as TestAccountName } ] )(
	'Help Center: Verify Help Center is accessible',
	function ( { accountName } ) {
		let page: Page;
		let supportComponent: SupportComponent;
		let testAccount: TestAccount;

		beforeAll( async function () {
			page = await browser.newPage();

			testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page, { waitUntilStable: true } );

			supportComponent = new SupportComponent( page );
		} );

		afterAll( async function () {
			await page.close();
		} );

		describe( 'Verify Help Center is opened and visible in Calypso', function () {
			it( 'Verify Help Center is initially closed', async function () {
				expect( await page.locator( '.help-center__container' ).isVisible() ).toBeFalsy();
			} );

			it( 'Open Help Center', async function () {
				await supportComponent.openPopover();
			} );

			it( 'Verify Help Center is opened', async function () {
				expect( await page.locator( '.help-center__container' ).isVisible() ).toBeTruthy();
			} );
		} );

		const helpCenterContainerVisibilityErrorMessage = `This is a bug that should be urgently fixed.
But because this test runs against ETK production, this bug was probably not introduced in this pull request.
Please consider alerting the last person who deployed ETK to attend to this issue and fix the Help Center.
You can view the history here: https://github.com/Automattic/wp-calypso/commits/trunk/apps/editing-toolkit`;

		describe( 'Verify Help Center is opened and visible in Editor', function () {
			it( 'Navigate to the Editor and verify the Help Center is initially closed', async function () {
				const postURL = DataHelper.getCalypsoURL(
					'/post/' + testAccount.getSiteURL( { protocol: false } )
				);

				await page.goto( postURL, {
					waitUntil: 'networkidle',
				} );
			} );

			it( 'Verify Help Center is initially closed', async function () {
				expect(
					await page
						.frameLocator( '.calypsoify iframe' )
						.locator( '.help-center__container' )
						.isVisible()
				).toBeFalsy();
			} );

			it( 'Open Help Center', async function () {
				await page
					.frameLocator( '.calypsoify iframe' )
					.getByLabel( 'Help', { exact: true } )
					.click();
			} );

			it( 'Verify Help Center is opened', async function () {
				const helpCenterContainerIsVisible = await page
					.frameLocator( '.calypsoify iframe' )
					.locator( '.help-center__container' )
					.isVisible();

				if ( ! helpCenterContainerIsVisible ) {
					throw new Error(
						`The Help Center is not visible in the Editor. ${ helpCenterContainerVisibilityErrorMessage }`
					);
				}

				expect( helpCenterContainerIsVisible ).toBeTruthy();
			} );
		} );

		describe( 'Verify Help Center is opened and visible in WP Admin', function () {
			it( 'Navigate to wp-admin page', async function () {
				const postURL = `${ testAccount.getSiteURL( {
					protocol: true,
				} ) }wp-admin/options-general.php`;
				await page.goto( postURL, {
					waitUntil: 'networkidle',
				} );
			} );

			it( 'Verify the Help Center is initially closed', async function () {
				expect( await page.locator( '.help-center__container' ).isVisible() ).toBeFalsy();
			} );

			it( 'Open Help Center', async function () {
				await page.locator( '#wp-admin-bar-help-center' ).click();
			} );

			it( 'Verify Help Center is opened', async function () {
				const helpCenterContainerIsVisible = await page
					.locator( '.help-center__container' )
					.isVisible();

				if ( ! helpCenterContainerIsVisible ) {
					throw new Error(
						`The Help Center is not visible in WP Admin. ${ helpCenterContainerVisibilityErrorMessage }`
					);
				}

				expect( helpCenterContainerIsVisible ).toBeTruthy();
			} );
		} );
	}
);

/**
 * Tests interaction with the Help Centre, simulating a user
 * looking for information on a specific topic, going through
 * help doccs and the Calypso links.
 */
describe( 'Help Center: Interact with Results', function () {
	let page: Page;
	let supportComponent: SupportComponent;

	beforeAll( async function () {
		page = await browser.newPage();

		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page, { waitUntilStable: true } );

		supportComponent = new SupportComponent( page );
	} );

	describe( 'Search for Help article', function () {
		it( 'Open Help Center', async function () {
			await supportComponent.openPopover();
		} );

		it( 'Search for posts-related help article', async function () {
			// We use domains below, but one of the domain-adjacent articles is currently broken:
			// https://github.com/Automattic/wp-calypso/issues/79576
			// Until that's fixed, let's steer clear and search a different topic.
			await supportComponent.search( 'posts' );
		} );

		it( 'Click on the second Help Docs result', async function () {
			await supportComponent.clickResultByIndex( 'Docs', 1 );
		} );

		it( 'Help Doc article is shown', async function () {
			const articleTitle = await supportComponent.getOpenArticleTitle();
			expect( articleTitle ).not.toBe( '' );
		} );
	} );

	describe( 'Navigate to Calypso Link', function () {
		let popupPage: Page;

		it( 'Close article and return to search results', async function () {
			await supportComponent.goBack();
		} );

		it( 'Clear search results', async function () {
			await supportComponent.clearSearch();
		} );

		it( 'Search for "domain"', async function () {
			await supportComponent.search( 'domain' );
		} );

		it( 'Click on the first Calypso Link result', async function () {
			const popupEvent = page.waitForEvent( 'popup' );
			await supportComponent.clickResultByIndex( 'Calypso Link', 0 );
			popupPage = await popupEvent;
		} );

		it( 'Calypso Link opens in a new page', async function () {
			expect( popupPage.url() ).not.toBe( page.url() );
		} );
	} );
} );
