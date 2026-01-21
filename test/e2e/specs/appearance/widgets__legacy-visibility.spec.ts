import { tags, test } from '../../lib/pw-base';

// Mobile viewport is skipped due to https://github.com/Automattic/wp-calypso/issues/64536. Remove DESKTOP_ONLY when fixed.
test.describe(
	'Appearance: Theme Widgets (Legacy)',
	{ tag: [ tags.GUTENBERG, tags.DESKTOP_ONLY ] },
	() => {
		test( 'As a non-atomic site user, I can use widgets on my site', async ( {
			page,
			accountGivenByEnvironment,
			clientRestAPI,
			componentBlockWidgetEditor,
			environment,
		} ) => {
			test.skip(
				environment.TEST_ON_ATOMIC,
				'Skipping for Atomic sites as the themes do not support widgets'
			);

			await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
				await accountGivenByEnvironment.authenticate( page );
			} );

			await test.step( 'And I have cleared all widgets on my site', async function () {
				await clientRestAPI.deleteAllWidgets(
					accountGivenByEnvironment.credentials.testSites?.primary.id as number
				);
			} );

			await test.step( 'When I navigate to Appearance > Widgets', async function () {
				await page.goto(
					`https://${ accountGivenByEnvironment.credentials.testSites?.primary.url }/wp-admin/widgets.php`,
					{ timeout: 25 * 1000 }
				);
			} );

			await test.step( 'And I dismiss the Welcome modals', async function () {
				await componentBlockWidgetEditor.dismissModals();
			} );

			await test.step( 'And I insert a Legacy Widget', async function () {
				await page.getByRole( 'button', { name: 'Add block' } ).click();
				await page.fill( 'input[placeholder="Search"]', 'Authors' );
				await page.click( 'button.editor-block-list-item-legacy-widget\\/authors' );
			} );

			await test.step( 'Then visibility options are shown for the Legacy Widget', async function () {
				await page.click( 'a.button:text("Visibility")' );
				await page.waitForSelector( 'div.widget-conditional' );
			} );
		} );
	}
);
