/**
 * @group gutenberg
 * @group jetpack-wpcom-integration
 */

import {
	DataHelper,
	envVariables,
	EditorPage,
	PublishedPostPage,
	TestAccount,
	PagesPage,
	getTestAccountByFeature,
	envToFeatureKey,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

const customUrlSlug = `about-${ DataHelper.getTimestamp() }-${ DataHelper.getRandomInteger(
	0,
	100
) }`;

describe( DataHelper.createSuiteTitle( 'Editor: Basic Page Flow' ), function () {
	const features = envToFeatureKey( envVariables );
	const accountName = getTestAccountByFeature(
		features,
		// The default accounts for gutenberg+simple are `gutenbergSimpleSiteEdgeUser` for GB edge
		// and `gutenbergSimpleSiteUser` for stable. The criteria below conflicts with the default
		// one that would return the `gutenbergSimpleSiteUser`. We also can't define it as part of
		// the default criteria, and should pass it here, as an override. For this specific function
		// call, `simpleSitePersonalPlanUser` will be retured when gutenberg is stable, and siteType
		// is simple.
		[ { gutenberg: 'stable', siteType: 'simple', accountName: 'simpleSitePersonalPlanUser' } ]
	);

	let page: Page;
	let editorPage: EditorPage;
	let pagesPage: PagesPage;
	let publishedUrl: URL;
	let pageTemplateToSelect: string;
	let pageTemplateFirstTextContent: string;

	beforeAll( async () => {
		page = await browser.newPage();

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Visit Pages page', async function () {
		pagesPage = new PagesPage( page );
		await pagesPage.visit();
	} );

	it( 'Start a new page', async function () {
		await pagesPage.addNewPage();
	} );

	it( 'Select page template', async function () {
		editorPage = new EditorPage( page );

		const editorParent = await editorPage.getEditorParent();

		const modalSelector = await editorParent.getByRole( 'listbox', { name: 'Block patterns' } );

		// The PR, https://github.com/WordPress/gutenberg/pull/69081, restored the starter content modal for newly created pages.
		// However, not all of themes have the page template. As a result, we have to check whether the modal is open.
		// If not, we can simply open the inserter from the sidebar manually.
		let selectedPatternLocator;
		try {
			await modalSelector.waitFor( { timeout: 3 * 1000 } );
			selectedPatternLocator = await modalSelector.getByRole( 'option' ).first();
		} catch ( e ) {
			// Probably doesn't exist. Let's add the pattern from the sidebar.
			selectedPatternLocator = await editorPage.addPatternFromSidebar( 'About (Page)' );
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

	it( 'Template content loads into editor', async function () {
		//await wait( 30000 ); // Wait for the template to load
		const editorCanvas = await editorPage.getEditorCanvas();
		expect( await editorCanvas.textContent() ).toContain( pageTemplateFirstTextContent );
	} );

	it( 'Open setting sidebar', async function () {
		await editorPage.openSettings();
	} );

	it( 'Set custom URL slug', async function () {
		await editorPage.setURLSlug( customUrlSlug );
	} );

	it( 'Close settings sidebar', async function () {
		await editorPage.closeSettings();
	} );

	it( 'Publish page', async function () {
		publishedUrl = await editorPage.publish( { visit: true } );
	} );

	it( 'Published URL contains the custom URL slug', async function () {
		expect( publishedUrl.pathname ).toContain( `/${ customUrlSlug }` );
	} );

	it( 'Published page contains template content', async function () {
		// Not a typo, it's the POM page class for a WordPress page. :)
		const publishedPagePage = new PublishedPostPage( page );
		await publishedPagePage.validateTextInPost( pageTemplateFirstTextContent );
	} );
} );
