import { envVariables } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

const isPrivateSite = envVariables.TEST_ON_ATOMIC && envVariables.ATOMIC_VARIATION === 'private';

/**
 * Tests features offered by Jetpack Social.
 *
 * Keywords: Social, Jetpack, Publicize
 */
test.describe(
	'Social: Editor Smoke test',
	{ tag: [ tags.CALYPSO_PR, tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		test.skip(
			isPrivateSite,
			'Skipping: Social features are not available on private Atomic sites'
		);

		test( 'Verify that Social UI is visible', async ( {
			accountGivenByEnvironment,
			pageEditor,
			page,
		} ) => {
			await test.step( 'Given the user opens the post editor', async () => {
				const siteSlug = accountGivenByEnvironment.getSiteURL( { protocol: false } );
				await accountGivenByEnvironment.authenticate( page );
				await pageEditor.visit( 'post', { siteSlug } );
			} );

			await test.step( 'When the user opens the Jetpack settings sidebar', async () => {
				await pageEditor.openSettings( 'Jetpack' );
			} );

			await test.step( 'And expands the "Share to social media" panel', async () => {
				await pageEditor.expandSection( 'Share to social media' );
			} );

			await test.step( 'Then either the "Auto-share post" toggle or "Connect your accounts" button is visible', async () => {
				const editorParent = await pageEditor.getEditorParent();

				const toggle = editorParent.getByLabel( 'Auto-share post' );
				const connectButton = editorParent.getByRole( 'button', {
					name: 'Connect your accounts',
				} );

				// Either "Auto-share post" toggle or "Connect your accounts" button should be visible.
				expect( ( await toggle.count() ) || ( await connectButton.count() ) ).toBeGreaterThan( 0 );
			} );
		} );
	}
);
