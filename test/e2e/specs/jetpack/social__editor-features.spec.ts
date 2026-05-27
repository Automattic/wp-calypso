/**
 * Tests features offered by Jetpack Social on a Simple site with Free plan.
 *
 * Keywords: Social, Jetpack, Publicize, Editor
 */

import {
	DataHelper,
	EditorPage,
	SocialConnectionsManager,
	TestAccount,
	TestAccountName,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
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

async function dismissPodcastPostPublishPromo( editorPage: EditorPage ): Promise< void > {
	const editorParent = await editorPage.getEditorParent();
	const dialog = editorParent
		.getByRole( 'dialog' )
		.filter( { hasText: 'Ready for the podcast version?' } )
		.first();

	const isVisible = await dialog
		.waitFor( { state: 'visible', timeout: 1000 } )
		.then( () => true )
		.catch( () => false );

	if ( ! isVisible ) {
		return;
	}

	await dialog.getByRole( 'button', { name: /close/i } ).first().click();
	await dialog.waitFor( { state: 'hidden', timeout: 5 * 1000 } );
}

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

test.describe(
	DataHelper.createSuiteTitle( 'Social: Editor features' ),
	{ tag: [ tags.CALYPSO_PR, tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		for ( const { plan, platform, testAccountName, features, isPrivate } of testCases ) {
			const title = `For ${ platform } sites with ${ plan } plan`;

			test.describe( DataHelper.createSuiteTitle( title ), () => {
				let siteSlug: string;
				let siteId: number;

				test.beforeEach( async ( { page } ) => {
					if ( isPrivate ) {
						test.skip();
					}
					const testAccount = new TestAccount( testAccountName );
					siteId = testAccount.credentials.testSites?.primary?.id || 0;
					siteSlug = testAccount.getSiteURL( { protocol: false } );
					await testAccount.authenticate( page );

					const editorPage = new EditorPage( page );
					await editorPage.visit( 'post', { siteSlug } );
				} );

				test.afterEach( async ( { page } ) => {
					const socialConnectionsManager = new SocialConnectionsManager( page, siteId );
					await socialConnectionsManager.clearIntercepts();
				} );

				test( 'Should verify that auto-sharing is available for new posts', async ( { page } ) => {
					const editorPage = new EditorPage( page );
					const socialConnectionsManager = new SocialConnectionsManager( page, siteId );

					await socialConnectionsManager.mockSocialConnections();

					await Promise.all( [
						editorPage.openSettings( 'Jetpack' ),
						socialConnectionsManager.waitForConnectionTests(),
					] );

					const section = await editorPage.expandSection( 'Share to social media' );

					const toggle = section.getByLabel( 'Auto-share post' );
					await expect( toggle ).toBeChecked();

					const messageBox = section.getByRole( 'textbox', { name: 'Message' } );
					await expect( messageBox ).toBeEditable();

					const mediaButton = section.getByRole( 'button', { name: 'Select' } );
					await expect( mediaButton ).toBeVisible( { visible: features.mediaSharing } );
				} );

				test( `Should verify that resharing ${
					features.resharing ? 'IS' : 'is NOT'
				} available`, async ( { page } ) => {
					const editorPage = new EditorPage( page );
					const socialConnectionsManager = new SocialConnectionsManager( page, siteId );

					let connectionTestPromise = Promise.resolve();
					await socialConnectionsManager.mockSocialConnections();
					connectionTestPromise = socialConnectionsManager.waitForConnectionTests();

					await editorPage.openSettings( 'Jetpack' );
					await connectionTestPromise;

					let section = await editorPage.expandSection( 'Share to social media' );

					let sharePostModalButton = section.getByRole( 'button', {
						name: 'Preview and customize',
						exact: true,
					} );
					await sharePostModalButton.click();

					const shareModal = ( await editorPage.getEditorParent() ).getByRole( 'dialog' ).filter( {
						hasText: 'Preview and customize',
					} );

					await shareModal.waitFor();
					let reshareButton = shareModal.getByRole( 'button', { name: 'Share', exact: true } );
					await expect( reshareButton ).toBeHidden();

					let closeButton = shareModal.getByRole( 'button', { name: 'Close' } ).first();
					await closeButton.click();

					await editorPage.enterTitle( 'Resharing: ' + DataHelper.getRandomPhrase() );

					await page.evaluate(
						"wp.data.dispatch( 'core/preferences' ).set( 'jetpack/social', 'show_pre_publish_confirmation', false )"
					);

					await editorPage.publish();
					connectionTestPromise = socialConnectionsManager.waitForConnectionTests();
					await dismissPodcastPostPublishPromo( editorPage );
					await editorPage.closeAllPanels();

					await editorPage.openSettings( 'Jetpack' );
					await connectionTestPromise;

					section = await editorPage.expandSection( 'Share to social media' );

					const toggle = section.getByLabel( 'Auto-share post' );
					await expect( toggle ).toBeHidden();

					sharePostModalButton = section.getByRole( 'button', {
						name: 'Preview and share',
						exact: true,
					} );

					await expect( sharePostModalButton ).toBeVisible( { visible: features.resharing } );

					let isReshareButtonVisible = false;

					if ( features.resharing ) {
						await sharePostModalButton.click();

						const shareModal2 = ( await editorPage.getEditorParent() )
							.getByRole( 'dialog' )
							.filter( { hasText: 'Customize and share to social media' } );
						await shareModal2.waitFor();

						reshareButton = shareModal2.getByRole( 'button', { name: 'Share', exact: true } );
						isReshareButtonVisible = await reshareButton.isVisible();

						closeButton = shareModal2.getByRole( 'button', { name: 'Close' } ).first();
						await closeButton.click();
					}
					expect( isReshareButtonVisible ).toBe( features.resharing );

					if ( ! features.resharing ) {
						const upgradeButton = section.getByRole( 'button', { name: 'Upgrade now' } );
						await upgradeButton.waitFor();
					}

					const content = await section.textContent();
					const message =
						'To re-share a post, you need to upgrade to the WordPress.com Premium plan';
					expect( content?.includes( message ) ).toBe( ! features.resharing );
				} );

				test( `Should verify that manual sharing ${
					features.manualSharing ? 'IS' : 'is NOT'
				} available`, async ( { page } ) => {
					const editorPage = new EditorPage( page );

					await editorPage.openSettings( 'Jetpack' );

					let section = await editorPage.expandSection( 'Share to social media' );

					let manualSharing = section.getByRole( 'paragraph', { name: 'Manual sharing' } );
					await expect( manualSharing ).toBeHidden();

					await editorPage.enterTitle( 'Manual sharing: ' + DataHelper.getRandomPhrase() );

					await page.evaluate(
						"wp.data.dispatch( 'core/preferences' ).set( 'jetpack/social', 'show_pre_publish_confirmation', false )"
					);

					await editorPage.publish();
					await dismissPodcastPostPublishPromo( editorPage );

					manualSharing = ( await editorPage.getPublishPanelRoot() ).getByRole( 'button', {
						name: 'Manual sharing',
					} );

					if ( features.manualSharing ) {
						await manualSharing.waitFor();
					}

					await editorPage.closeAllPanels();

					await editorPage.openSettings( 'Jetpack' );

					section = await editorPage.expandSection( 'Share to social media' );

					manualSharing = section.getByText( 'Manual sharing' );
					await expect( manualSharing ).toBeVisible( { visible: features.manualSharing } );
				} );

				if ( features.socialImageGenerator ) {
					test( 'Should verify that Social Image Generator is available', async ( { page } ) => {
						const editorPage = new EditorPage( page );
						const socialConnectionsManager = new SocialConnectionsManager( page, siteId );

						await socialConnectionsManager.mockSocialConnections();
						const connectionTestPromise = socialConnectionsManager.waitForConnectionTests();

						await editorPage.openSettings( 'Jetpack' );
						await connectionTestPromise;

						const section = await editorPage.expandSection( 'Share to social media' );

						await section.getByRole( 'button', { name: 'Select' } ).click();

						const popoverGroup = page.getByRole( 'group', { name: 'Link preview' } );
						const templatebutton = popoverGroup.getByRole( 'menuitemradio', {
							name: 'Social image template',
						} );

						await expect( templatebutton ).toBeVisible();
						await expect( templatebutton ).toBeEnabled();
					} );
				}
			} );
		}
	}
);
