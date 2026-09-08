import { expect, tags, test } from '../../lib/pw-base';

// Name of the legacy widget block variation under test. The inserter renders it as a
// button whose class carries the same name, so both must stay in step.
const LEGACY_WIDGET = 'authors';

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

			// The editor boot alone is budgeted at 60s, which the default 120s ceiling cannot
			// hold alongside login, setup and the insertion steps.
			test.setTimeout( 180 * 1000 );

			await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
				await accountGivenByEnvironment.authenticate( page );
			} );

			await test.step( 'And I have cleared all widgets on my site', async function () {
				await clientRestAPI.deleteAllWidgets(
					accountGivenByEnvironment.credentials.testSites?.primary.id as number
				);
			} );

			await test.step( 'When I navigate to Appearance > Widgets', async function () {
				// The editor's deferred module scripts hold back both `load` and
				// `domcontentloaded` long after the server has answered, so this waits only for
				// the response. Readiness is asserted against the editor in the next step.
				const response = await page.goto(
					`https://${ accountGivenByEnvironment.credentials.testSites?.primary.url }/wp-admin/widgets.php`,
					{ timeout: 25 * 1000, waitUntil: 'commit' }
				);

				// `goto` resolves for any status, so a 500 or a bounce to wp-login.php would
				// otherwise surface much later as a missing editor.
				expect( response?.status() ).toBe( 200 );
				await expect( page ).toHaveURL( /widgets\.php/ );
			} );

			await test.step( 'And the widget editor is ready', async function () {
				await componentBlockWidgetEditor.waitUntilLoaded( LEGACY_WIDGET );
			} );

			await test.step( 'And I dismiss the Welcome modals', async function () {
				await componentBlockWidgetEditor.dismissModals();
			} );

			await test.step( 'And I insert a Legacy Widget', async function () {
				await page.getByRole( 'button', { name: 'Add block' } ).click();
				await page.fill( 'input[placeholder="Search"]', 'Authors' );
				await page.click( `button.editor-block-list-item-legacy-widget\\/${ LEGACY_WIDGET }` );
			} );

			await test.step( 'Then visibility options are shown for the Legacy Widget', async function () {
				await page.click( 'a.button:text("Visibility")' );
				await page.waitForSelector( 'div.widget-conditional' );
			} );
		} );
	}
);
