import { EditorPage } from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe( 'Editor: Navbar', { tag: [ tags.GUTENBERG, tags.CALYPSO_PR ] }, () => {
	test( 'As a user, I can return to Calypso dashboard from the editor', async ( {
		page,
		accountGivenByEnvironment,
		environment,
	} ) => {
		let editorPage: EditorPage;

		await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
			await accountGivenByEnvironment.authenticate( page );
		} );

		await test.step( 'When I go to the new post page', async function () {
			editorPage = new EditorPage( page );
			await editorPage.visit( 'post' );
		} );

		await test.step( 'Then I can return to Calypso dashboard', async function () {
			const WPAdminBarLocator = page.locator( '#wpadminbar' );
			const isMobileClassicView =
				environment.VIEWPORT_NAME === 'mobile' && ( await WPAdminBarLocator.isVisible() );

			// The classic WP Admin Bar on mobile viewport doesn't have the
			// "return" button, so let's not fail this test if it's the case.
			// See https://github.com/Automattic/wp-calypso/pull/70982
			if ( ! isMobileClassicView ) {
				await editorPage.exitEditor();
			}
		} );
	} );
} );
