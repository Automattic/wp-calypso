import { EditorPage, PublishedPostPage, PagesPage } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe(
	'Editor: Basic Page Flow',
	{ tag: [ tags.GUTENBERG, tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		test( 'As a user, I can create a page with a template and custom URL slug', async ( {
			page,
			accountGivenByEnvironment,
			helperData,
		} ) => {
			const customUrlSlug = `about-${ helperData.getTimestamp() }-${ helperData.getRandomInteger(
				0,
				100
			) }`;

			let editorPage: EditorPage;
			let pagesPage: PagesPage;
			let publishedUrl: URL;
			let pageTemplateToSelect: string;
			let pageTemplateFirstTextContent: string;

			await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
				await accountGivenByEnvironment.authenticate( page );
			} );

			await test.step( 'When I visit the Pages page', async function () {
				pagesPage = new PagesPage( page );
				await pagesPage.visit();
			} );

			await test.step( 'And I start a new page', async function () {
				await pagesPage.addNewPage();
			} );

			await test.step( 'And I select a page template', async function () {
				editorPage = new EditorPage( page );

				const editorParent = await editorPage.getEditorParent();

				const modalSelector = await editorParent.getByRole( 'listbox', {
					name: /^(All|Block patterns)$/,
				} );

				// The PR, https://github.com/WordPress/gutenberg/pull/69081, restored the starter content modal for newly created pages.
				// However, not all themes have the page template. As a result, we have to check whether the modal is open.
				// If not, we can simply open the inserter from the sidebar manually.
				let selectedPatternLocator;
				try {
					await modalSelector.waitFor( { timeout: 3 * 1000 } );
					selectedPatternLocator = await modalSelector.getByRole( 'option' ).first();
				} catch ( e ) {
					// Probably doesn't exist. Let's add the first pattern that starts with "About" from the sidebar.
					selectedPatternLocator = await editorPage.addPatternFromSidebar( 'About', false );
				}

				pageTemplateFirstTextContent =
					( await selectedPatternLocator
						.frameLocator( 'iframe' )
						.locator( '.is-root-container' )
						.locator( 'p, h1, h2, h3, h4, h5, h6, blockquote, ul, ol' )
						.first()
						.textContent() ) || '';

				pageTemplateFirstTextContent = pageTemplateFirstTextContent.trim();
				pageTemplateToSelect = ( await selectedPatternLocator.getAttribute( 'aria-label' ) ) ?? '';
				await editorPage.selectTemplate( pageTemplateToSelect, { timeout: 15 * 1000 } );
			} );

			await test.step( 'Then the template content loads into the editor', async function () {
				const editorCanvas = await editorPage.getEditorCanvas();
				expect( await editorCanvas.textContent() ).toContain( pageTemplateFirstTextContent );
			} );

			await test.step( 'When I open the settings sidebar', async function () {
				await editorPage.openSettings();
			} );

			await test.step( 'And I set a custom URL slug', async function () {
				await editorPage.setURLSlug( customUrlSlug );
			} );

			await test.step( 'And I close the settings sidebar', async function () {
				await editorPage.closeSettings();
			} );

			await test.step( 'And I publish the page', async function () {
				publishedUrl = await editorPage.publish( { visit: true } );
			} );

			await test.step( 'Then the published URL contains the custom URL slug', async function () {
				expect( publishedUrl.pathname ).toContain( `/${ customUrlSlug }` );
			} );

			await test.step( 'And the published page contains the template content', async function () {
				const publishedPagePage = new PublishedPostPage( page );
				await publishedPagePage.validateTextInPost( pageTemplateFirstTextContent );
			} );
		} );
	}
);
