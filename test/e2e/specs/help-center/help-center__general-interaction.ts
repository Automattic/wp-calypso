/**
 * @group calypso-pr
 */

import { SupportComponent, TestAccount, TestAccountName } from '@automattic/calypso-e2e';
import { Browser, Frame, Page } from 'playwright';

declare const browser: Browser;

/** Tests to ensure the Help Center is open and visible in Calypso and the Editor */
describe.each( [
	{ accountName: 'defaultUser' as TestAccountName },
	{ accountName: 'atomicUser' as TestAccountName },
] )( 'Help Center: Verify Help Center is accessible', function ( { accountName } ) {
	let page: Page;
	let supportComponent: SupportComponent;

	beforeAll( async function () {
		page = await browser.newPage();

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page, { waitUntilStable: true } );

		supportComponent = new SupportComponent( page );
	} );

	describe( 'Verify Help Center is opened and visible in Calypso', function () {
		it( 'Verify Help Center is initially closed', async function () {
			expect( await page.locator( '.help-center__container' ).isVisible() ).toBeFalsy();
		} );

		it( 'Open Help Center', async function () {
			await supportComponent.openPopover();
		} );

		it( 'Verify Help Center is opened', async function () {
			expect( await page.locator( '.help-center__container' ).isVisible() );
		} );
	} );

	describe( 'Verify Help Center is opened and visible in Editor', function () {
		let selectedFrame: Frame;

		beforeAll( async function () {
			const frames = page.frames();
			for ( let i = 0; i < frames.length; ++i ) {
				if ( frames[ i ].url().includes( 'calypsoify' ) ) {
					selectedFrame = frames[ i ];
				}
			}
		} );

		it( 'Verify Help Center is initially closed', async function () {
			expect( await selectedFrame?.locator( '.help-center__container' ).isVisible() ).toBeFalsy();
		} );

		it( 'Open Help Center', async function () {
			const testAccount = new TestAccount( accountName );
			const postURL = `http://wordpress.com/post/${ testAccount.getSiteURL( {
				protocol: false,
			} ) }`;
			await page.goto( postURL, {
				waitUntil: 'networkidle',
			} );
		} );

		it( 'Verify Help Center is opened', async function () {
			await selectedFrame?.$eval( 'button.help-center', ( el ) => ( el as HTMLElement ).click() );
			expect( await selectedFrame?.locator( '.help-center__container' ).isVisible() );
			page.close();
		} );
	} );
} );

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
