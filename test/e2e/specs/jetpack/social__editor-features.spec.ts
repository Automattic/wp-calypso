import {
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
	SocialConnectionsManager,
	TestAccount,
	TestAccountName,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

const features4SimpleSites = {
	resharing: false,
	manualSharing: true,
	mediaSharing: false,
	socialImageGenerator: false,
};

const features4BusinessPlan = {
	resharing: true,
	manualSharing: true,
	mediaSharing: true,
	socialImageGenerator: true,
};

const testCases: Array< {
	plan: string;
	platform: 'Simple' | 'Atomic';
	testAccountName: TestAccountName;
	features: Record<
		'resharing' | 'manualSharing' | 'mediaSharing' | 'socialImageGenerator',
		boolean
	>;
	isPrivate?: boolean;
} > = [];

if ( envVariables.JETPACK_TARGET === 'wpcom-deployment' ) {
	testCases.push( {
		plan: envVariables.TEST_ON_ATOMIC ? 'Paid' : 'Business',
		platform: envVariables.TEST_ON_ATOMIC ? 'Atomic' : 'Simple',
		testAccountName: getTestAccountByFeature( envToFeatureKey( envVariables ) ),
		features: features4BusinessPlan,
		isPrivate: envVariables.TEST_ON_ATOMIC && envVariables.ATOMIC_VARIATION === 'private',
	} );
} else {
	testCases.push(
		{
			plan: 'Free',
			platform: 'Simple',
			testAccountName: 'simpleSiteFreePlanUser',
			features: features4SimpleSites,
		},
		{
			plan: 'Personal',
			platform: 'Simple',
			testAccountName: 'simpleSitePersonalPlanUser',
			features: features4SimpleSites,
		}
	);
}

/**
 * Tests features offered by Jetpack Social on a Simple site with Free plan.
 *
 * Keywords: Social, Jetpack, Publicize, Editor
 */
test.describe(
	'Social: Editor features',
	{ tag: [ tags.CALYPSO_PR, tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		for ( const { plan, platform, testAccountName, features, isPrivate } of testCases ) {
			const title = `For ${ platform } sites with ${ plan } plan`;

			test.describe( title, () => {
				test.skip( isPrivate ?? false, 'Skipping: Private Atomic sites are not supported' );

				let socialConnectionsManager: SocialConnectionsManager;
				let siteSlug: string;
				let siteId: number;
				let testAccount: TestAccount;

				test.beforeAll( async () => {
					testAccount = new TestAccount( testAccountName );
					siteId = testAccount.credentials.testSites?.primary?.id || 0;
					siteSlug = testAccount.getSiteURL( { protocol: false } );
				} );

				test.beforeEach( async ( { page, pageEditor } ) => {
					await testAccount.authenticate( page );
					socialConnectionsManager = new SocialConnectionsManager( page, siteId );
					await pageEditor.visit( 'post', { siteSlug } );
				} );

				test.afterEach( async () => {
					await socialConnectionsManager.clearIntercepts();
				} );

				test( 'Should verify that auto-sharing is available for new posts', async ( {
					pageEditor,
				} ) => {
					await socialConnectionsManager.mockSocialConnections();

					await test.step( 'Given the user opens the Jetpack settings sidebar', async () => {
						await Promise.all( [
							pageEditor.openSettings( 'Jetpack' ),
							socialConnectionsManager.waitForConnectionTests(),
						] );
					} );

					await test.step( 'When the user expands the "Share to social media" panel', async () => {
						await pageEditor.expandSection( 'Share to social media' );
					} );

					await test.step( 'Then the auto-share toggle is enabled', async () => {
						const section = await pageEditor.expandSection( 'Share to social media' );
						const toggle = section.getByLabel( 'Auto-share post' );
						expect( await toggle.isChecked() ).toBe( true );
					} );

					await test.step( 'And the message box is editable', async () => {
						const section = await pageEditor.expandSection( 'Share to social media' );
						const messageBox = section.getByRole( 'textbox', { name: 'Message' } );
						expect( await messageBox.isEditable() ).toBe( true );
					} );

					await test.step( `And the media button is ${
						features.mediaSharing ? 'visible' : 'not visible'
					}`, async () => {
						const section = await pageEditor.expandSection( 'Share to social media' );
						const mediaButton = section.getByRole( 'button', { name: 'Choose Media' } );
						expect( await mediaButton.isVisible() ).toBe( features.mediaSharing );
					} );
				} );

				test( `Should verify that resharing ${
					features.resharing ? 'IS' : 'is NOT'
				} available`, async ( { pageEditor, helperData } ) => {
					await socialConnectionsManager.mockSocialConnections();

					await test.step( 'Given the user opens the Jetpack settings and shares to social media', async () => {
						const connectionTestPromise = socialConnectionsManager.waitForConnectionTests();
						await pageEditor.openSettings( 'Jetpack' );
						await connectionTestPromise;
					} );

					await test.step( 'When the user opens the social preview modal on a new post', async () => {
						const section = await pageEditor.expandSection( 'Share to social media' );
						const sharePostModalButton = section.getByRole( 'button', {
							name: 'Preview social posts',
							exact: true,
						} );
						await sharePostModalButton.click();
					} );

					await test.step( 'Then the Share button is not visible in the preview modal', async () => {
						const shareModal = ( await pageEditor.getEditorParent() )
							.getByRole( 'dialog' )
							.filter( {
								hasText: 'Social Preview',
							} );

						await shareModal.waitFor();
						const reshareButton = shareModal.getByRole( 'button', {
							name: 'Share',
							exact: true,
						} );

						expect( await reshareButton.isVisible() ).toBe( false );

						const closeButton = shareModal.getByRole( 'button', { name: 'Close' } );
						await closeButton.click();
					} );

					await test.step( 'Given the user publishes the post', async () => {
						await pageEditor.enterTitle( 'Resharing: ' + helperData.getRandomPhrase() );
						await pageEditor.publish();
						await pageEditor.closeAllPanels();
					} );

					await test.step( 'When the user reopens the Jetpack social settings', async () => {
						const connectionTestPromise = socialConnectionsManager.waitForConnectionTests();
						await pageEditor.openSettings( 'Jetpack' );
						await connectionTestPromise;
					} );

					await test.step( 'Then the auto-share toggle is no longer visible', async () => {
						const section = await pageEditor.expandSection( 'Share to social media' );
						const toggle = section.getByLabel( 'Auto-share post' );
						expect( await toggle.isVisible() ).toBe( false );
					} );

					await test.step( `And the Preview & Share button is ${
						features.resharing ? 'visible' : 'not visible'
					}`, async () => {
						const section = await pageEditor.expandSection( 'Share to social media' );
						const sharePostModalButton = section.getByRole( 'button', {
							name: 'Preview & Share',
							exact: true,
						} );
						expect( await sharePostModalButton.isVisible() ).toBe( features.resharing );

						let isReshareButtonVisible = false;

						if ( features.resharing ) {
							await sharePostModalButton.click();

							const shareModal = ( await pageEditor.getEditorParent() )
								.getByRole( 'dialog' )
								.filter( {
									hasText: 'Share Post',
								} );
							await shareModal.waitFor();

							const reshareButton = shareModal.getByRole( 'button', {
								name: 'Share',
								exact: true,
							} );
							isReshareButtonVisible = await reshareButton.isVisible();

							const closeButton = shareModal.getByRole( 'button', { name: 'Close' } );
							await closeButton.click();
						}
						expect( isReshareButtonVisible ).toBe( features.resharing );
					} );

					if ( ! features.resharing ) {
						await test.step( 'And the upgrade nudge is visible', async () => {
							const section = await pageEditor.expandSection( 'Share to social media' );
							const upgradeButton = section.getByRole( 'button', { name: 'Upgrade now' } );
							await upgradeButton.waitFor();

							const content = await section.textContent();
							const message =
								'To re-share a post, you need to upgrade to the WordPress.com Premium plan';
							expect( content?.includes( message ) ).toBe( true );
						} );
					}
				} );

				test( `Should verify that manual sharing ${
					features.manualSharing ? 'IS' : 'is NOT'
				} available`, async ( { pageEditor, helperData } ) => {
					await test.step( 'Given the user opens the Jetpack settings sidebar', async () => {
						await pageEditor.openSettings( 'Jetpack' );
					} );

					await test.step( 'When the user expands the "Share to social media" panel', async () => {
						await pageEditor.expandSection( 'Share to social media' );
					} );

					await test.step( 'Then manual sharing is NOT visible before publishing', async () => {
						const section = await pageEditor.expandSection( 'Share to social media' );
						const manualSharing = section.getByRole( 'paragraph', { name: 'Manual sharing' } );
						expect( await manualSharing.isVisible() ).toBe( false );
					} );

					await test.step( 'Given the user publishes the post', async () => {
						await pageEditor.enterTitle( 'Manual sharing: ' + helperData.getRandomPhrase() );
						await pageEditor.publish();
					} );

					await test.step( `Then manual sharing is ${
						features.manualSharing ? 'visible' : 'not visible'
					} in the publish panel`, async () => {
						const manualSharing = ( await pageEditor.getPublishPanelRoot() ).getByRole( 'button', {
							name: 'Manual sharing',
						} );

						if ( features.manualSharing ) {
							await manualSharing.waitFor();
						}
					} );

					await test.step( 'When the user reopens the Jetpack social settings', async () => {
						await pageEditor.closeAllPanels();
						await pageEditor.openSettings( 'Jetpack' );
					} );

					await test.step( `Then manual sharing is ${
						features.manualSharing ? 'visible' : 'not visible'
					} in the Jetpack sidebar`, async () => {
						const section = await pageEditor.expandSection( 'Share to social media' );
						const manualSharing = section.getByText( 'Manual sharing' );
						expect( await manualSharing.isVisible() ).toBe( features.manualSharing );
					} );
				} );

				test( `Should verify that Social Image Generator ${
					features.socialImageGenerator ? 'IS' : 'is NOT'
				} available`, async ( { pageEditor } ) => {
					await socialConnectionsManager.mockSocialConnections();

					await test.step( 'Given the user opens the Jetpack settings sidebar', async () => {
						const connectionTestPromise = socialConnectionsManager.waitForConnectionTests();
						await pageEditor.openSettings( 'Jetpack' );
						await connectionTestPromise;
					} );

					await test.step( 'When the user expands the "Share to social media" panel', async () => {
						await pageEditor.expandSection( 'Share to social media' );
					} );

					await test.step( `Then the Social Image toggle is ${
						features.socialImageGenerator ? 'visible' : 'not visible'
					}`, async () => {
						const section = await pageEditor.expandSection( 'Share to social media' );
						const toggle = section.getByLabel( 'Enable Social Image' );
						expect( await toggle.isVisible() ).toBe( features.socialImageGenerator );
					} );
				} );
			} );
		}
	}
);
