import {
	DataHelper,
	TestAccount,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Editor: Navbar' ),
	{ tag: [ tags.GUTENBERG, tags.CALYPSO_PR ] },
	() => {
		const features = envToFeatureKey( envVariables );
		const accountName = getTestAccountByFeature( features, [
			{
				gutenberg: 'stable',
				siteType: 'simple',
				accountName: 'simpleSitePersonalPlanUser',
			},
		] );

		test( 'As a user, I can navigate back to Calypso from the editor', async ( {
			page,
			pageEditor,
		} ) => {
			await test.step( 'Given I am authenticated', async () => {
				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
			} );

			await test.step( 'When I go to the new post page', async () => {
				await pageEditor.visit( 'post' );
			} );

			await test.step( 'When I return to Calypso dashboard', async () => {
				const WPAdminBarLocator = page.locator( '#wpadminbar' );
				const isMobileClassicView =
					envVariables.VIEWPORT_NAME === 'mobile' && ( await WPAdminBarLocator.isVisible() );

				// The classic WP Admin Bar on mobile viewport doesn't have the
				// "return" button, so let's not fail this test if it's the case.
				// See https://github.com/Automattic/wp-calypso/pull/70982
				if ( ! isMobileClassicView ) {
					await pageEditor.exitEditor();
				}
			} );
		} );
	}
);
