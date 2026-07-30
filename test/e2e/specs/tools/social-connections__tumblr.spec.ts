/**
 * Sets up a Tumblr social connection for the site.
 *
 * Note, Private sites do not support Social/Publicize connections.
 *
 * Keywords: Social Connections, Marketing, Jetpack, Tumblr, Publicize
 */

import {
	DataHelper,
	MarketingPage,
	RestAPIClient,
	TestAccount,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Social Connections: Set up Tumblr' ),
	{ tag: [ tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		test( 'As a user, I can navigate to the Tumblr connection page', async ( { page } ) => {
			test.skip(
				envVariables.ATOMIC_VARIATION === 'private',
				'Social connections not supported on private sites'
			);

			let marketingPage: MarketingPage;

			await test.step( 'Setup: authenticate and remove existing Tumblr connection if any', async () => {
				const features = envToFeatureKey( envVariables );
				const accountName = getTestAccountByFeature( features );
				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );

				const restAPIClient = new RestAPIClient( testAccount.credentials );

				const connections = await restAPIClient.getAllPublicizeConnections(
					testAccount.credentials.testSites?.primary.id as number
				);

				for ( const connection of connections ) {
					if ( connection.label === 'Tumblr' ) {
						console.info(
							`Removing existing connection for Tumblr for accountName ${ accountName }.`
						);
						await restAPIClient.deletePublicizeConnection( connection.site_ID, connection.ID );
					}
				}

				marketingPage = new MarketingPage( page );
			} );

			await test.step( 'Navigate to Tools > Marketing > Connections page', async () => {
				const testAccount = new TestAccount(
					getTestAccountByFeature( envToFeatureKey( envVariables ) )
				);
				await marketingPage.visitTab(
					testAccount.getSiteURL( { protocol: false } ),
					'connections'
				);
			} );

			// Skipping the bulk of the spec, as it's flaky. We're working on better E2E tests.
		} );
	}
);
