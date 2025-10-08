import path from 'path';
import { expect, tags, test } from '../../lib/pw-base';

const TEST_WORDPRESS_EXPORT_FILE_PATH = path.join(
	__dirname,
	'import-files',
	'wordpress-export-example.xml'
);

test.describe(
	'Site Import: Calypso: WordPress',
	{
		tag: [ tags.CALYPSO_RELEASE, tags.IMPORTS ],
		annotation: { type: 'flowchart', description: 'https://flowchart.fun/p/mute-color-normalize' },
	},
	() => {
		test( 'As a New WordPress.com free plan user with a simple site, I can use the "WordPress Run Importer" link on the wp-admin Importers List page to import my content from my WordPress site', async ( {
			pageImportContentFromWordPress,
			sitePublic,
		}, workerInfo ) => {
			test.skip( workerInfo.project.name !== 'chrome', 'The import tests only run in Chrome' );

			await test.step( 'When I visit the WordPress importer as coming from the wp-admin Tools > Import page', async function () {
				await pageImportContentFromWordPress.visit( sitePublic.blog_details.site_slug );
			} );

			await test.step( 'Then I see the Import content from WordPress page', async function () {
				await expect( pageImportContentFromWordPress.heading ).toBeVisible();
			} );

			await test.step( 'When I upload a valid WordPress export file', async function () {
				await pageImportContentFromWordPress.uploadExportFile( TEST_WORDPRESS_EXPORT_FILE_PATH );
			} );

			await test.step( 'Then I see an Import confirmation page showing the authorship of the content to be imported', async function () {
				await expect( pageImportContentFromWordPress.heading ).toBeVisible();
				await expect( pageImportContentFromWordPress.yourFileIsReadyText ).toBeVisible( {
					timeout: 30000,
				} );
				await expect( pageImportContentFromWordPress.importButton ).toBeVisible();
				await expect( pageImportContentFromWordPress.importButton ).toBeEnabled();
			} );
		} );
	}
);
