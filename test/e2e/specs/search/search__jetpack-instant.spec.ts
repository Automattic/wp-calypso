/**
 * @group jetpack-wpcom-integration
 */

import {
	DataHelper,
	envVariables,
	TestAccount,
	getTestAccountByFeature,
	envToFeatureKey,
	RestAPIClient,
	JetpackInstantSearchModalComponent,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';
import { skipDescribeIf } from '../../jest-helpers';

declare const browser: Browser;

/* 
	Unfortunately, we can't test Search as thoroughly as we'd like, as the time to index new posts
	is variable (up to several minutes). This means we're limited to validating the integrity and
	interactability of the search modal.
*/

skipDescribeIf( envVariables.ATOMIC_VARIATION === 'private' )(
	DataHelper.createSuiteTitle( 'Jetpack Instant Search' ),
	function () {
		const searchString = DataHelper.getRandomPhrase();

		const postWithSearchBlockTitle = `Search Block ${ DataHelper.getTimestamp() }-${ DataHelper.getRandomInteger(
			1,
			10
		) }`;
		let postWithSearchBlockUrl: string;

		let page: Page;
		let testAccount: TestAccount;
		let restAPIClient: RestAPIClient;
		let siteId: number;

		const features = envToFeatureKey( envVariables );
		const accountName = getTestAccountByFeature( features );

		let searchModalComponent: JetpackInstantSearchModalComponent;

		beforeAll( async () => {
			page = await browser.newPage();

			testAccount = new TestAccount( accountName );
			siteId = testAccount.credentials.testSites?.primary.id as number;
			restAPIClient = new RestAPIClient( testAccount.credentials );
		} );

		it( 'Create a post with the search block', async function () {
			const response = await restAPIClient.createPost( siteId, {
				title: postWithSearchBlockTitle,
				content: '<!-- wp:search {"label":"Search","buttonText":"Search"} /-->',
			} );

			postWithSearchBlockUrl = response.URL;
		} );

		it( 'Navigate to post with search block', async function () {
			// We can't wait for the "load" event because WordAds mess with it.
			// But, if Playwright outpaces the search JS load, you can get weird artifacts like the search term getting wiped out.
			// So we need to wait for the search JS to load before we start interacting with the page.
			const waitForSearchJsPromise = page.waitForResponse(
				( response ) =>
					response
						.url()
						.includes( 'jetpack-search/build/instant-search/jp-search.chunk-main-payload.js' ),
				{ timeout: 30 * 1000 }
			);

			await page.goto( postWithSearchBlockUrl, {
				timeout: 20 * 1000,
				waitUntil: 'domcontentloaded',
			} );

			await waitForSearchJsPromise;

			searchModalComponent = new JetpackInstantSearchModalComponent( page );
		} );

		it( 'Enter search term and launch search modal', async function () {
			// Sometimes the parent block on a homepage has a very high-up aria-hidden.
			// TODO: figure out what is adding that, and remove the "includeHidden" here.
			const inputLocator = page
				.getByRole( 'search', { includeHidden: true } )
				.getByRole( 'searchbox', { name: 'Search', includeHidden: true } )
				.first();
			const buttonLocator = page
				.getByRole( 'search', { includeHidden: true } )
				.getByRole( 'button', { name: 'Search', includeHidden: true } )
				.first();

			// Adding a slightly longer timeout here because we can't fully wait for the "load" event above due to
			// a collision with WordAds. This helps share some of the initial load wait with the first interaction.
			await inputLocator.fill( searchString, { timeout: 20 * 1000 } );
			await Promise.all( [
				searchModalComponent.expectAndWaitForSearch( searchString ),
				buttonLocator.click(),
			] );
		} );

		it( 'The search term pulls into the modal', async function () {
			// See: https://github.com/Automattic/jetpack/issues/32753
			// There's a rare race condition where the spaces get URL encoded as "+" and that pulls into the modal.
			// We don't wait to fail on that, so accounting for it specifically here.
			const termInModal = ( await searchModalComponent.getSearchTerm() ).replace( /\+/g, ' ' );
			expect( termInModal ).toEqual( searchString );
		} );

		it( 'Clear the search term', async function () {
			await Promise.all( [
				searchModalComponent.expectAndWaitForSearch( '' ),
				searchModalComponent.clearSearchTerm(),
			] );

			expect( await searchModalComponent.getSearchTerm() ).toEqual( '' );
		} );

		it( 'Close the modal', async function () {
			await searchModalComponent.closeModal();
		} );
	}
);
