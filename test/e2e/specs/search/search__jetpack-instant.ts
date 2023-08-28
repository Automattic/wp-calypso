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
import { skipItIf } from '../../jest-helpers';

declare const browser: Browser;

/* 
	Unfortunately, we can't test Search as thoroughly on Atomic as we can on Simple sites.
	Indexing of new posts on Simple site is REALLY fast, usually seconds.
	On Atomic, it's more variable and usually on the scale of a few minutes.
	This means we can't create reliable data conditions to validate the actual search result content.
	So on atomic, we're limited to validating the integtity and interactability of the search modal.
*/

describe( DataHelper.createSuiteTitle( 'Jetpack Instant Search' ), function () {
	const searchString = DataHelper.getRandomPhrase();

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

	skipItIf( envVariables.TEST_ON_ATOMIC )(
		'Create a new post using the REST API',
		async function () {
			const postResponse = await restAPIClient.createPost( siteId, {
				title: searchString,
				content: searchString,
			} );

			console.log( postResponse );
		}
	);

	skipItIf( envVariables.TEST_ON_ATOMIC )(
		'Wait for index to update using the REST API',
		async function () {
			await waitForIndexToUpdate( restAPIClient, siteId, searchString );
		}
	);

	it( 'Navigate to site homepage', async function () {
		const isPrivateAtomicSite =
			envVariables.TEST_ON_ATOMIC && envVariables.ATOMIC_VARIATION === 'private';

		if ( isPrivateAtomicSite ) {
			// First, get a fresh cookie.
			await testAccount.authenticate( page );
		}

		await page.goto( testAccount.getSiteURL( { protocol: true } ), { timeout: 20 * 1000 } );

		if ( isPrivateAtomicSite ) {
			// On private Atomic sites, still have to click the blue Log In button to use your cookie.
			await page.getByRole( 'link', { name: 'Log in' } ).click();
			// Then let all the redirects settle.
			await page.waitForURL( testAccount.getSiteURL( { protocol: true } ), { timeout: 20 * 1000 } );
		}

		searchModalComponent = new JetpackInstantSearchModalComponent( page );
	} );

	it( 'Enter search term and launch search modal', async function () {
		const inputLocator = page
			.getByRole( 'search' )
			.getByRole( 'searchbox', { name: 'Search' } )
			.first();
		const buttonLocator = page
			.getByRole( 'search' )
			.getByRole( 'button', { name: 'Search' } )
			.first();

		await inputLocator.fill( searchString );
		await Promise.all( [ searchModalComponent.expectAndWaitForSearch(), buttonLocator.click() ] );
	} );

	it( 'The search term pulls into the modal', async function () {
		expect( await searchModalComponent.getSearchTerm() ).toEqual( searchString );
	} );

	skipItIf( envVariables.TEST_ON_ATOMIC )( 'There are search results', async function () {
		expect( await searchModalComponent.getNumberOfResults() ).toBeGreaterThanOrEqual( 1 );
	} );

	skipItIf( envVariables.TEST_ON_ATOMIC )(
		'The search term is present in the results as a highlighted match',
		async function () {
			await searchModalComponent.validateHighlightedMatch( searchString );
		}
	);

	it( 'Clear the search term', async function () {
		await Promise.all( [
			searchModalComponent.expectAndWaitForSearch(),
			searchModalComponent.clearSearchTerm(),
		] );

		expect( await searchModalComponent.getSearchTerm() ).toEqual( '' );
	} );

	skipItIf( envVariables.TEST_ON_ATOMIC )(
		'There are still default popular results',
		async function () {
			expect( await searchModalComponent.getNumberOfResults() ).toBeGreaterThanOrEqual( 1 );
		}
	);

	skipItIf( envVariables.TEST_ON_ATOMIC )(
		'There are no highlighted matches in the results',
		async function () {
			expect( await searchModalComponent.getNumberOfHighlightedMatches() ).toBe( 0 );
		}
	);

	it( 'Close the modal', async function () {
		await searchModalComponent.closeModal();
	} );
} );

async function waitForIndexToUpdate(
	restAPIClient: RestAPIClient,
	siteId: number,
	expectedSearch: string
) {
	const sleep = ( ms: number ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) );
	const MAX_RETRIES = 15;
	const RETRY_INTERVAL_MS = 3000;
	for ( let i = 0; i < MAX_RETRIES; i++ ) {
		// We start with the sleep because, c'mon, it's not going to re-index instantly!
		// So puting the polling delay upfront makes the most sense. The test is still very fast!
		await sleep( RETRY_INTERVAL_MS );
		const response = await restAPIClient.jetpackSearch( siteId, {
			query: expectedSearch,
			// We are incrementing size here to bust the ElasticSearch cache.
			// Otherwise, if it hasn't indexed the post by the first search request, the ES cache will
			// continue to return no results, even after the post has been indexed!!!!
			// We just need there to be any hit for the post name, so we can just keep bumping the size
			// to do the cache busting.
			size: i + 1,
		} );
		if ( response.results.length > 0 ) {
			return;
		}
	}

	throw new Error(
		`Could not find any Jetpack Search results for query ${ expectedSearch } after 45 seconds. The index may not be updating.`
	);
}
