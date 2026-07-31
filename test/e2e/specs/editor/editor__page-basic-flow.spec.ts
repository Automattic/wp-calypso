import {
	DataHelper,
	PagesPage,
	PublishedPostPage,
	TestAccount,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

const customUrlSlug = `about-${ DataHelper.getTimestamp() }-${ DataHelper.getRandomInteger(
	0,
	100
) }`;

test.describe(
	DataHelper.createSuiteTitle( 'Editor: Basic Page Flow' ),
	{ tag: [ tags.GUTENBERG, tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		const features = envToFeatureKey( envVariables );
		const accountName = getTestAccountByFeature( features, [
			{ gutenberg: 'stable', siteType: 'simple', accountName: 'simpleSitePersonalPlanUser' },
		] );

		test( 'As a user, I can create and publish a page with a custom slug', async ( {
			page,
			pageEditor,
		} ) => {
			let pagesPage: PagesPage;
			let publishedUrl: URL;
			let pageTemplateFirstTextContent: string;

			await test.step( 'Given I am authenticated', async () => {
				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page, { waitUntilStable: false } );
			} );

			await test.step( 'When I visit the Pages page', async () => {
				const siteSlug = new TestAccount( accountName ).getSiteURL( { protocol: false } );
				pagesPage = new PagesPage( page );
				await pagesPage.visit( { siteSlug } );
			} );

			await test.step( 'When I start a new page', async () => {
				await pagesPage!.addNewPage();
			} );

			await test.step( 'When I select a page template', async () => {
				const editorParent = await pageEditor.getEditorParent();
				const modalSelector = editorParent.getByRole( 'listbox', {
					name: /^(All|Block patterns)$/,
				} );

				let selectedPatternLocator;
				try {
					await modalSelector.waitFor( { timeout: 3 * 1000 } );
					selectedPatternLocator = modalSelector.getByRole( 'option' ).first();
				} catch ( e ) {
					selectedPatternLocator = await pageEditor.addPatternFromSidebar( 'About', false );
				}

				pageTemplateFirstTextContent =
					( await selectedPatternLocator
						.frameLocator( 'iframe' )
						.locator( '.is-root-container' )
						.locator( 'p, h1, h2, h3, h4, h5, h6, blockquote, ul, ol' )
						.first()
						.textContent() ) || '';
				pageTemplateFirstTextContent = pageTemplateFirstTextContent.trim();
				await pageEditor.selectTemplate( selectedPatternLocator, { timeout: 15 * 1000 } );
			} );

			await test.step( 'Then template content loads into editor', async () => {
				const editorCanvas = await pageEditor.getEditorCanvas();
				expect( await editorCanvas.textContent() ).toContain( pageTemplateFirstTextContent! );
			} );

			await test.step( 'When I open settings sidebar', async () => {
				await pageEditor.openSettings();
			} );

			await test.step( 'When I set custom URL slug', async () => {
				await pageEditor.setURLSlug( customUrlSlug );
			} );

			await test.step( 'When I close settings sidebar', async () => {
				await pageEditor.closeSettings();
			} );

			await test.step( 'When I publish page', async () => {
				publishedUrl = await pageEditor.publish( { visit: true } );
			} );

			await test.step( 'Then published URL contains the custom URL slug', async () => {
				expect( publishedUrl!.pathname ).toContain( `/${ customUrlSlug }` );
			} );

			await test.step( 'Then published page contains template content', async () => {
				const publishedPagePage = new PublishedPostPage( page );
				await publishedPagePage.validateTextInPost( pageTemplateFirstTextContent! );
			} );
		} );
	}
);
