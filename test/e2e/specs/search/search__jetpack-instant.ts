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

declare const browser: Browser;

async function waitForIndexToUpdate(
	restAPIClient: RestAPIClient,
	siteId: number,
	expectedQuery: string
) {
	const sleep = ( ms: number ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) );
	const MAX_RETRIES = 5;
	const RETRY_INTERVAL_MS = 3000;
	for ( let i = 0; i < MAX_RETRIES; i++ ) {
		const response = await restAPIClient.jetpackSearch( siteId, expectedQuery );
		console.log( response );
		if ( response.total > 0 ) {
			return;
		}
		// Only sleep if it's not the last iteration
		if ( i < MAX_RETRIES - 1 ) {
			await sleep( RETRY_INTERVAL_MS );
		}
	}

	throw new Error(
		`Could not find any Jetpack Search results for query ${ expectedQuery } after 15 seconds. The index may not be updating.`
	);
}

describe( DataHelper.createSuiteTitle( 'Jetpack Instant Search' ), function () {
	const searchString = 'bazbatquxbigword';
	let page: Page;
	let testAccount: TestAccount;

	const features = envToFeatureKey( envVariables );
	const accountName = getTestAccountByFeature( features );

	let searchModalComponent: JetpackInstantSearchModalComponent;

	beforeAll( async () => {
		page = await browser.newPage();

		testAccount = new TestAccount( accountName );
		const siteId = testAccount.credentials.testSites?.primary.id as number;

		const restAPIClient = new RestAPIClient( testAccount.credentials );

		await restAPIClient.createPost( siteId, {
			title: searchString,
			content: searchString,
		} );

		// TODO: this check isn't working -- something's messed up in the index query.
		await waitForIndexToUpdate( restAPIClient, siteId, searchString );
	} );

	it( 'Navigate to site homepage', async function () {
		await page.goto( testAccount.getSiteURL( { protocol: true } ) );

		searchModalComponent = new JetpackInstantSearchModalComponent( page );
	} );

	it( 'Enter search term and launch search modal', async function () {
		const inputLocator = page.getByRole( 'search' ).getByRole( 'searchbox', { name: 'Search' } );
		const buttonLocator = page.getByRole( 'search' ).getByRole( 'button', { name: 'Search' } );

		await inputLocator.fill( searchString );
		await Promise.all( [ searchModalComponent.expectAndWaitForSearch(), buttonLocator.click() ] );
	} );

	it( 'The search term pulls into the modal', async function () {
		expect( await searchModalComponent.getSearchTerm() ).toEqual( searchString );
	} );

	it( 'There are search results', async function () {
		expect( await searchModalComponent.getNumberOfResults() ).toBeGreaterThanOrEqual( 1 );
	} );

	it( 'The search term is present in the results as a highlighted match', async function () {
		await searchModalComponent.validateHighlightedMatch( searchString );
	} );

	it( 'Clear the search term', async function () {
		await Promise.all( [
			searchModalComponent.expectAndWaitForSearch(),
			searchModalComponent.clearSearchTerm(),
		] );

		expect( await searchModalComponent.getSearchTerm() ).toEqual( '' );
	} );

	it( 'There are still default popular results', async function () {
		expect( await searchModalComponent.getNumberOfResults() ).toBeGreaterThanOrEqual( 1 );
	} );

	it( 'There are no highlighted matches in the results', async function () {
		expect( await searchModalComponent.getNumberOfHighlightedMatches() ).toBe( 0 );
	} );

	it( 'Close the modal', async function () {
		await searchModalComponent.closeModal();
	} );
} );
