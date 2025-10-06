import { expect, tags, test } from '../../lib/pw-base';

test.describe(
	'Site Import: Calypso: Medium',
	{ tag: [ tags.CALYPSO_RELEASE, tags.IMPORTS ] },
	() => {
		test( 'As a WordPress.com free plan user with a simple site, I can use the wp-admin Importers List Medium link to import my content from my medium.com account', async ( {
			accountSimpleSiteFreePlan,
			page,
			helperData,
		} ) => {
			await test.step( `Given I am authenticated as '${ accountSimpleSiteFreePlan.accountName }'`, async function () {
				await accountSimpleSiteFreePlan.authenticate( page );
			} );

			await test.step( 'When I visit the Medium importer as coming from the wp-admin Tools > Import page', async function () {
				await page.goto(
					helperData.getCalypsoURL( 'setup/site-setup/importerMedium', {
						ref: 'wp-admin-importers-list-direct-importer',
						siteSlug: accountSimpleSiteFreePlan.getSiteURL( { protocol: false } ),
					} )
				);
			} );

			await test.step( 'Then I see the Import content from Medium page', async function () {
				await expect(
					page.getByRole( 'heading', { name: 'Import content from Medium' } )
				).toBeVisible();
			} );

			await test.step( 'When I upload a valid Medium export file', async function () {
				await page
					.locator( 'input[type="file"]' )
					.setInputFiles( 'test/e2e/image-uploads/medium-export-example.zip' );
			} );

			await test.step( 'Then I see an Import confirmation page showing the authorship of the content to be imported', async function () {
				await expect(
					page.getByRole( 'heading', { name: 'Import content from Medium' } )
				).toBeVisible();
				await expect( page.getByText( 'Your file is ready to be imported' ) ).toBeVisible();
				await expect( page.getByRole( 'button', { name: 'Import' } ) ).toBeVisible();
				await expect( page.getByRole( 'button', { name: 'Import' } ) ).toBeEnabled();
			} );
		} );
	}
);
