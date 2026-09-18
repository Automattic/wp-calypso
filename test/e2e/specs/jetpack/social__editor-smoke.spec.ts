import {
	DataHelper,
	EditorPage,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
	TestAccount,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

/**
 * Tests features offered by Jetpack Social.
 *
 * Keywords: Social, Jetpack, Publicize
 */
test.describe(
	DataHelper.createSuiteTitle( 'Social: Editor Smoke test' ),
	{ tag: [ tags.CALYPSO_PR, tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		test( 'As a user, I can see the Social UI in the editor', async ( { page } ) => {
			const isPrivateSite =
				envVariables.TEST_ON_ATOMIC && envVariables.ATOMIC_VARIATION === 'private';
			test.skip( isPrivateSite, 'Skipped on private atomic sites' );

			let editorPage: EditorPage;
			let siteSlug: string;

			await test.step( 'Authenticate and setup the test', async () => {
				editorPage = new EditorPage( page );

				const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );
				const testAccount = new TestAccount( accountName );
				siteSlug = testAccount.getSiteURL( { protocol: false } );
				await testAccount.authenticate( page );
			} );

			await test.step( 'Verify that Social UI is visible', async () => {
				await editorPage.visit( 'post', { siteSlug } );

				// Open the Jetpack sidebar.
				await editorPage.openSettings( 'Jetpack' );

				// Expand the Publicize panel.
				await editorPage.expandSection( 'Share to social media' );

				const editorParent = await editorPage.getEditorParent();

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
