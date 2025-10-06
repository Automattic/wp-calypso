import { expect, tags, test } from '../../lib/pw-base';
import { TEST_MEDIUM_EXPORT_FILE_PATH } from '../constants';

test.describe(
	'Site Import: Calypso: Medium',
	{
		tag: [ tags.CALYPSO_RELEASE, tags.IMPORTS ],
		annotation: { type: 'flowchart', description: 'https://flowchart.fun/p/envious-tent-cost' },
	},
	() => {
		test.describe.configure( { mode: 'serial' } ); // Since all tests use the same account you can only run a single import at a time
		const importEndpointRegex = /rest\/v1\.1\/sites\/\d+\/imports\//;

		test( 'As a WordPress.com free plan user with a simple site, I can use the wp-admin Importers List Medium link to import my content from my medium.com account', async ( {
			accountSimpleSiteFreePlan,
			page,
			helperData,
		}, workerInfo ) => {
			test.skip( workerInfo.project.name !== 'chrome', 'The import tests only run in Chrome' );

			await test.step( `Given I am authenticated as '${ accountSimpleSiteFreePlan.accountName }'`, async function () {
				await accountSimpleSiteFreePlan.authenticate( page );
			} );

			await test.step( 'When I visit the Medium importer as coming from the wp-admin Tools > Import page', async function () {
				await page.route( importEndpointRegex, async ( route ) => {
					console.log( 'Mocking the imports endpoint' );
					await route.fulfill( {
						status: 200,
						contentType: 'application/json',
						body: '{}',
					} );
				} );
				await page.goto(
					helperData.getCalypsoURL( 'setup/site-setup/importerMedium', {
						ref: 'wp-admin-importers-list-direct-importer',
						siteSlug: accountSimpleSiteFreePlan.getSiteURL( { protocol: false } ),
						isUploadInProgress: 'false',
					} )
				);
			} );

			await test.step( 'Then I see the Import content from Medium page', async function () {
				await expect(
					page.getByRole( 'heading', { name: 'Import content from Medium' } )
				).toBeVisible();
				await page.unroute( importEndpointRegex );
			} );

			await test.step( 'When I upload a valid Medium export file', async function () {
				await page.locator( 'input[type="file"]' ).setInputFiles( TEST_MEDIUM_EXPORT_FILE_PATH );
			} );

			await test.step( 'Then I see an Import confirmation page showing the authorship of the content to be imported', async function () {
				await expect(
					page.getByRole( 'heading', { name: 'Import content from Medium' } )
				).toBeVisible();
				await expect( page.getByText( 'Your file is ready to be imported' ) ).toBeVisible( {
					timeout: 30000,
				} );
				await expect( page.getByRole( 'button', { name: 'Import' } ) ).toBeVisible();
				await expect( page.getByRole( 'button', { name: 'Import' } ) ).toBeEnabled();
			} );
		} );

		test( 'As a WordPress.com free plan user with a simple site, I can use the wp-admin Importers List WordPress.com link to import my content from my medium.com account', async ( {
			accountSimpleSiteFreePlan,
			page,
			helperData,
		}, workerInfo ) => {
			test.skip( workerInfo.project.name !== 'chrome', 'The import tests only run in Chrome' );

			const mediumSiteURL = 'https://medium.com/@testacount';

			await test.step( `Given I am authenticated as '${ accountSimpleSiteFreePlan.accountName }'`, async function () {
				await accountSimpleSiteFreePlan.authenticate( page );
			} );

			await test.step( 'When I visit the "Let\'s find your site" page as coming from the wp-admin Tools > Import page', async function () {
				await page.goto(
					helperData.getCalypsoURL( 'setup/site-migration/site-migration-identify', {
						hide_importer_link: 'true',
						siteSlug: accountSimpleSiteFreePlan.getSiteURL( { protocol: false } ),
						isUploadInProgress: 'false',
					} )
				);
			} );

			await test.step( "Then I see the Let's find your site page", async function () {
				await expect( page.getByRole( 'heading', { name: "Let's find your site" } ) ).toBeVisible();
			} );

			await test.step( 'When I enter my Medium site URL and click Continue', async function () {
				await page.route( importEndpointRegex, async ( route ) => {
					console.log( 'Mocking the imports endpoint' );
					await route.fulfill( {
						status: 200,
						contentType: 'application/json',
						body: '{}',
					} );
				} );
				await page
					.getByRole( 'textbox', { name: 'Enter your site address:' } )
					.fill( mediumSiteURL );
				await page.getByRole( 'button', { name: 'Check my site' } ).click();
			} );

			await test.step( 'Then I see the Import content from Medium page', async function () {
				await expect(
					page.getByRole( 'heading', { name: 'Import content from Medium' } )
				).toBeVisible();
				await page.unroute( importEndpointRegex );
			} );

			await test.step( 'When I upload a valid Medium export file', async function () {
				await page.locator( 'input[type="file"]' ).setInputFiles( TEST_MEDIUM_EXPORT_FILE_PATH );
			} );

			await test.step( 'Then I see an Import confirmation page showing the authorship of the content to be imported', async function () {
				await expect(
					page.getByRole( 'heading', { name: 'Import content from Medium' } )
				).toBeVisible();
				await expect( page.getByText( 'Your file is ready to be imported' ) ).toBeVisible( {
					timeout: 30000,
				} );
				await expect( page.getByRole( 'button', { name: 'Import' } ) ).toBeVisible();
				await expect( page.getByRole( 'button', { name: 'Import' } ) ).toBeEnabled();
			} );
		} );
	}
);
