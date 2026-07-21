import { DataHelper } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';
import { TEST_IMAGE_PATH } from '../constants';

test.describe(
	DataHelper.createSuiteTitle( 'Blaze Ads: Promote' ),
	{ tag: [ tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		test( 'As a WordPress.com user, I can promote my content using Jetpack Blaze', async ( {
			accountGivenByEnvironment,
			accountSimpleSiteFreePlan,
			environment,
			helperData,
			helperMedia,
			page,
			pageAdvertising,
			pageBlazeCampaign,
		} ) => {
			test.skip(
				environment.ATOMIC_VARIATION === 'private',
				'Blaze is unavailable on private sites'
			);

			const testAccount = environment.TEST_ON_ATOMIC
				? accountGivenByEnvironment
				: accountSimpleSiteFreePlan;
			const pageTitle = helperData.getRandomPhrase().slice( 0, 20 );
			const snippet = Array( 2 ).fill( helperData.getRandomPhrase() ).toString();

			await test.step( `Given I am authenticated as '${ testAccount.accountName }'`, async function () {
				await testAccount.authenticate( page );
			} );

			await test.step( 'And my site has a published post', async function () {
				const hasPosts = await testAccount.restAPI.siteHasPost(
					testAccount.credentials.testSites?.primary.id as number,
					{ state: 'publish' }
				);

				if ( ! hasPosts ) {
					console.log( 'Creating a new post for the site' );
					await testAccount.restAPI.createPost(
						testAccount.credentials.testSites?.primary.id as number,
						{
							title: pageTitle,
						}
					);
				}
			} );

			await test.step( 'When I visit the Tools > Blaze Ads page', async function () {
				await pageAdvertising.visit( testAccount.getSiteURL( { protocol: false } ) );
			} );

			await test.step( 'Then I see the Blaze Ads page for my site', async function () {
				await expect( pageAdvertising.advertisingHeading ).toBeVisible();
			} );

			await test.step( 'When I click on Promote for the first post', async function () {
				await pageAdvertising.clickButtonByNameOnRow( 'Promote', { row: 0 } );
			} );

			await test.step( 'Then I land in Blaze campaign landing page', async function () {
				// Wait for the Blaze Campaign page to load - this can take a while!
				await expect( pageBlazeCampaign.makeMostOfYourBlazeCampaignHeading ).toBeVisible( {
					timeout: 30_000,
				} );
			} );

			await test.step( 'When I click on Get started', async function () {
				await pageBlazeCampaign.clickButton( 'Get started' );
			} );

			await test.step( 'And I upload an image', async function () {
				const testFile = await helperMedia.createTestFile( TEST_IMAGE_PATH );
				await pageBlazeCampaign.uploadImage( testFile );
			} );

			await test.step( 'And I enter a title and snippet', async function () {
				await pageBlazeCampaign.enterText( 'Site title', pageTitle );
				await pageBlazeCampaign.enterText( 'Snippet', snippet );
			} );

			await test.step( 'Then I validate the preview', async function () {
				await pageBlazeCampaign.validatePreview( { title: pageTitle, snippet: snippet } );
			} );
		} );
	}
);
