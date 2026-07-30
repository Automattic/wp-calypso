/**
 * Unfortunately, we can't test Search as thoroughly as we'd like, as the time to index new posts
 * is variable (up to several minutes). This means we're limited to validating the integrity and
 * interactability of the search modal.
 */

import {
	DataHelper,
	JetpackInstantSearchModalComponent,
	RestAPIClient,
	TestAccount,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { expect, skipIfNotJetpackTarget, tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Jetpack Instant Search' ),
	{ tag: [ tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		// Instant Search only loads on a site with the Jetpack Search product.
		skipIfNotJetpackTarget();

		test( 'As a user, I can use Jetpack Instant Search', async ( { page } ) => {
			test.skip(
				envVariables.ATOMIC_VARIATION === 'private',
				'Search not available on private sites'
			);

			// Must resolve inside the test: a throw at describe scope aborts collection for the entire run.
			const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );

			const searchString = DataHelper.getRandomPhrase();
			const postWithSearchBlockTitle = `Search Block ${ DataHelper.getTimestamp() }-${ DataHelper.getRandomInteger(
				1,
				10
			) }`;
			let postWithSearchBlockUrl: string;
			let searchModalComponent: JetpackInstantSearchModalComponent;

			const testAccount = new TestAccount( accountName );
			const siteId = testAccount.credentials.testSites?.primary.id as number;
			const restAPIClient = new RestAPIClient( testAccount.credentials );

			await test.step( 'Create a post with the search block', async () => {
				const response = await restAPIClient.createPost( siteId, {
					title: postWithSearchBlockTitle,
					content: '<!-- wp:search {"label":"Search","buttonText":"Search"} /-->',
				} );
				postWithSearchBlockUrl = response.URL;
			} );

			await test.step( 'Navigate to post with search block', async () => {
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

			await test.step( 'Enter search term and launch search modal', async () => {
				// Sometimes the parent block on a homepage has a very high-up aria-hidden.
				const inputLocator = page
					.getByRole( 'search', { includeHidden: true } )
					.getByRole( 'searchbox', { name: 'Search', includeHidden: true } )
					.first();
				const buttonLocator = page
					.getByRole( 'search', { includeHidden: true } )
					.getByRole( 'button', { name: 'Search', includeHidden: true } )
					.first();

				await inputLocator.fill( searchString, { timeout: 20 * 1000 } );
				await Promise.all( [
					searchModalComponent.expectAndWaitForSearch( searchString ),
					buttonLocator.click(),
				] );
			} );

			await test.step( 'The search term pulls into the modal', async () => {
				// See: https://github.com/Automattic/jetpack/issues/32753
				const termInModal = ( await searchModalComponent.getSearchTerm() ).replace( /\+/g, ' ' );
				expect( termInModal ).toEqual( searchString );
			} );

			await test.step( 'Clear the search term', async () => {
				await Promise.all( [
					searchModalComponent.expectAndWaitForSearch( '' ),
					searchModalComponent.clearSearchTerm(),
				] );
				expect( await searchModalComponent.getSearchTerm() ).toEqual( '' );
			} );

			await test.step( 'Close the modal', async () => {
				await searchModalComponent.closeModal();
			} );
		} );
	}
);
