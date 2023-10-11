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
	TestAccount,
	SecretsManager,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

/**
 * Sets up a Tumblr social connection for the site.
 *
 * Note, Private sites do not support Social/Publicize connections.
 *
 * Keywords: Social Connections, Marketing, Jetpack, Tumblr, Publicize
 */
describe.skip( DataHelper.createSuiteTitle( 'Social Connections: Set up Tumblr' ), function () {
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
		for ( const connection of connections ) {
			if ( connection.label === 'Tumblr' ) {
				console.info( `Removing existing connection for Tumblr for accountName ${ accountName }.` );
				await restAPIClient.deletePublicizeConnection( connection.site_ID, connection.ID );
			}
		}

		marketingPage = new MarketingPage( page );
	} );

	it( 'Navigate to Tools > Marketing page', async function () {
		await marketingPage.visit( testAccount.getSiteURL( { protocol: false } ) );
	} );

	it( 'Click on Connections tab', async function () {
		await marketingPage.clickTab( 'Connections' );
	} );

	it( 'Click on the "Connect" button for Tumblr', async function () {
		popup = await marketingPage.clickSocialConnectButton( 'Tumblr' );
	} );

	it( 'Set up Tumblr', async function () {
		await marketingPage.setupTumblr( popup, SecretsManager.secrets.socialAccounts.tumblr );
	} );

	it( 'Tumblr is connected', async function () {
		await marketingPage.validateSocialConnected( 'Tumblr' );
	} );
} );
