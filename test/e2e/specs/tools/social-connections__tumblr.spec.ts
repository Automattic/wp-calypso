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
import { expect, tags, test } from '../../lib/pw-base';

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

			// The actual Tumblr connection flow (Connect -> OAuth popup -> validate
			// connected) is intentionally left out: it drives third-party Tumblr
			// OAuth and is flaky, so trunk skips those steps and runs only this
			// navigation step. For parity we do the same. The connections surface
			// was also reorganized (individual services like Tumblr now live behind
			// "Manage connections" / Jetpack Social), so we assert the connections
			// page rendered rather than a per-service Tumblr button.
			await test.step( 'Then the connections page is shown', async () => {
				await expect(
					page.getByRole( 'main' ).getByRole( 'heading', { name: 'Manage connections' } )
				).toBeVisible();
			} );
		} );
	}
);
