/**
 * @group gutenberg
 * @group jetpack-wpcom-integration
 */

import {
	DataHelper,
	EditorPage,
	PublishedPostPage,
	TestAccount,
	ParagraphBlock,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
} from '@automattic/calypso-e2e';
import { Page, Browser, Response } from 'playwright';
import { skipDescribeIf, skipItIf } from '../../jest-helpers';

const quote =
	'The problem with quotes on the Internet is that it is hard to verify their authenticity.\nby Abraham Lincoln';
const title = DataHelper.getRandomPhrase();
const category = 'Uncategorized';
const tag = 'test-tag';
const seoTitle = 'SEO example title';
const seoDescription = 'SEO example description';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Editor: Basic Post Flow' ), function () {
	const features = envToFeatureKey( envVariables );
	const accountName = getTestAccountByFeature( features, [
		{ gutenberg: 'stable', siteType: 'simple', accountName: 'simpleSitePersonalPlanUser' },
	] );

	let page: Page;
	let testAccount: TestAccount;
	let editorPage: EditorPage;
	let publishedPostPage: PublishedPostPage;
	let publishedURL: URL;

	beforeAll( async () => {
		page = await browser.newPage();
		editorPage = new EditorPage( page );

		testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Go to the new post page', async function () {
		await editorPage.visit( 'post' );
	} );

	describe( 'Blocks', function () {
		it( 'Enter post title', async function () {
			await editorPage.enterTitle( title );
		} );

		it( 'Enter post content', async function () {
			const blockHandle = await editorPage.addBlockFromSidebar(
				ParagraphBlock.blockName,
				ParagraphBlock.blockEditorSelector,
				{ noSearch: true }
			);
			const paragraphBlock = new ParagraphBlock( blockHandle );
			await paragraphBlock.enterParagraph( quote, { type: true } );
		} );
	} );

	describe( 'Patterns', function () {
		const patternName = 'About (Page)';

		it( `Add ${ patternName } pattern`, async function () {
			await editorPage.addPatternFromSidebar( patternName );
		} );
	} );

	describe( 'Categories and Tags', function () {
		it( 'Open post settings', async function () {
			await editorPage.openSettings( 'Settings' );
		} );

		it( 'Add post category', async function () {
			await editorPage.selectCategory( category );
		} );

		it( 'Add post tag', async function () {
			await editorPage.addTag( tag );
		} );

		afterAll( async function () {
			// For mobile, but doesn't hurt to do this for Desktop either.
			await editorPage.closeSettings();
		} );
	} );

	describe( 'Jetpack features', function () {
		it( 'Open Jetpack settings', async function () {
			// @TODO https://github.com/Automattic/wp-calypso/pull/82301
			// Works around the scenario where the Jetpack icon isn't pinned on the
			// editor toolbar.
			await editorPage.openEditorOptionsMenu();
			const page = await editorPage.getEditorParent();

			await page.getByRole( 'menuitemcheckbox', { name: 'Jetpack' } ).click();
		} );

		skipItIf( envVariables.TEST_ON_ATOMIC !== true )(
			'Enter SEO title and preview',
			async function () {
				await editorPage.enterSEODetails( {
					title: seoTitle,
					description: seoDescription,
				} );
			}
		);

		it( 'Open social preview', async function () {
			await editorPage.expandSection( 'Social Previews' );
			await editorPage.clickSidebarButton( 'Open Social Previews' );
		} );

		it( 'Show social preview for Tumblr', async function () {
			// Action implemented as "raw" calls for now (2023-09).
			const editorParent = await editorPage.getEditorParent();
			const dialog = editorParent.getByRole( 'dialog' );

			await dialog.getByRole( 'tab', { name: 'Tumblr' } ).click();
			await dialog.getByRole( 'tabpanel', { name: 'Tumblr' } ).waitFor();
			await dialog
				.filter( {
					// Look for either the SEO title, or the post title,
					// depending on whether the platform had SEO options
					// two steps previously.
					hasText: new RegExp( `${ seoTitle }|${ title }` ),
				} )
				.waitFor();
		} );

		it( 'Dismiss social preview', async function () {
			await page.keyboard.press( 'Escape' );
		} );

		afterAll( async function () {
			// For mobile, but doesn't hurt to do this for Desktop either.
			await editorPage.closeSettings();
		} );
	} );

	describe( 'Preview', function () {
		let previewPage: Page;

		it( 'Launch preview', async function () {
			if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
				previewPage = await editorPage.previewAsMobile();
			} else {
				await editorPage.previewAsDesktop( 'Mobile' );
			}
		} );

		it( 'Close preview', async function () {
			if ( previewPage ) {
				// Mobile path - close the new page.
				await previewPage.close();
			} else {
				// Desktop path - restore the Desktop view.
				await editorPage.closePreview();
			}
		} );

		// Step skipped for mobile, since previewing naturally saves the post, rendering this step unnecessary.
		skipItIf( envVariables.VIEWPORT_NAME === 'mobile' )( 'Save draft', async function () {
			await editorPage.saveDraft();
		} );

		it( 'Publish post', async function () {
			publishedURL = await editorPage.publish();
		} );
	} );

	// Skip test on Private site, because posts are not visible to non-logged out users.
	skipDescribeIf( envVariables.ATOMIC_VARIATION === 'private' )( 'View post', function () {
		let newPage: Page;
		let response: Response;

		beforeAll( async function () {
			newPage = await browser.newPage();
		} );

		it( 'View published post', async function () {
			// Check for `blog` and `post` query params, used for stats tracking.
			const trackingPixelLoaded = newPage.waitForResponse(
				new RegExp(
					`pixel.wp.com/g.gif.*blog=${ testAccount.credentials.testSites?.primary.id }+.*&post=[\\d]+`
				)
			);
			await newPage.goto( publishedURL.href );

			// Wrap the `waitForResponse` wait so it does not fail this step should the tracking pixel
			// fail to load.
			// This way if the tracking pixel ever fails to load, the most accurate test step fails.
			try {
				response = await trackingPixelLoaded;
			} catch {
				// noop - will throw in next step.
			}

			expect( publishedURL.href ).toStrictEqual( newPage.url() );
		} );

		it( 'Jetpack Stats tracking pixel is loaded', async function () {
			expect( response ).toBeDefined();
			expect( response.status() ).toBe( 200 );
		} );

		it( 'Post content is found in published post', async function () {
			publishedPostPage = new PublishedPostPage( newPage );
			await publishedPostPage.validateTitle( title );
			for ( const part of quote.split( '\n' ) ) {
				await publishedPostPage.validateTextInPost( part );
			}
		} );

		it( 'Post metadata is found in published post', async function () {
			await publishedPostPage.validateCategory( category );
			await publishedPostPage.validateTags( tag );
		} );

		// Not checking the `Press This` button as it is not available on AT.
		// @see: paYJgx-1lp-p2
		it.each( [ { name: 'X' }, { name: 'Facebook' } ] )(
			'Social sharing button for $name can be clicked',
			async function ( { name } ) {
				publishedPostPage = new PublishedPostPage( newPage );
				await publishedPostPage.validateSocialButton( name, { click: true } );
			}
		);
	} );
} );
