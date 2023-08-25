/**
 * @group jetpack-wpcom-integration
 */

import {
	envToFeatureKey,
	getTestAccountByFeature,
	envVariables,
	DataHelper,
	MarketingPage,
	RestAPIClient,
	SidebarComponent,
	TestAccount,
	SecretsManager,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

/**
 * Sets up a Tumblr social connection for the site.
 *
 * Keywords: Social Connections, Marketing, Jetpack, Tumblr, Publicize
 */
describe( DataHelper.createSuiteTitle( 'Social Connections: Set up Tumblr' ), function () {
	let page: Page;
	let popup: Page;

	let testAccount: TestAccount;
	let restAPIClient: RestAPIClient;
	let marketingPage: MarketingPage;

	beforeAll( async () => {
		page = await browser.newPage();

		const features = envToFeatureKey( envVariables );
		const accountName = getTestAccountByFeature( features );
		testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );

		restAPIClient = new RestAPIClient( testAccount.credentials );

		// Check whether a Tumblr connection exists.
		const connections = await restAPIClient.getAllPublicizeConnections(
			testAccount.credentials.testSites?.primary.id as number
		);

		// If it does, remove the connection.
		Object.values( connections ).forEach( async ( connection ) => {
			if ( connection.label === 'Tumblr' ) {
				console.info( `Removing existing connection for Tumblr for accountName ${ accountName }.` );
				await restAPIClient.deletePublicizeConnection( connection.site_ID, connection.ID );
			}
		} );
	} );

	it( 'Navigate to Tools > Marketing page', async function () {
		const sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.navigate( 'Tools', 'Marketing' );
	} );

	it( 'Click on Connections tab', async function () {
		marketingPage = new MarketingPage( page );
		await marketingPage.clickTab( 'Connections' );
	} );

	it( 'Click on the "Connect" button for Tumblr', async function () {
		popup = await marketingPage.clickSocialConnectButton( 'Tumblr' );
	} );

	it( 'Set up Tumblr', async function () {
		await marketingPage.setupTumblr( popup, SecretsManager.secrets.socialAccounts.tumblr );
	} );

	it( 'Tumblr is connected', async function () {
		const connected = await marketingPage.validateSocialConnected( 'Tumblr' );
		expect( connected ).toBe( true );
	} );
} );
