import {
	DataHelper,
	envVariables,
	GutenbergEditorPage,
	PublishedPostPage,
	TestAccount,
	PagesPage,
	PageTemplateModalComponent,
} from '@automattic/calypso-e2e';
import { Browser, Page, Frame } from 'playwright';

declare const browser: Browser;

const pageTemplateCategory = 'About';
const pageTemplateLable = 'About layout with intro and contact';
const expectedTemplateText = 'Our Mission';
const customUrlSlug = `about-${ DataHelper.getTimestamp() }-${ DataHelper.getRandomInteger(
	0,
	100
) }`;

describe( DataHelper.createSuiteTitle( 'Editor: Basic Post Flow' ), function () {
	let page: Page;
	let gutenbergEditorPage: GutenbergEditorPage;
	let editorIframe: Frame;
	let pagesPage: PagesPage;
	let publishedUrl: URL;
	const accountName = envVariables.GUTENBERG_EDGE
		? 'gutenbergSimpleSiteEdgeUser'
		: 'simpleSitePersonalPlanUser';

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
		gutenbergEditorPage = new GutenbergEditorPage( page );
		// @TODO Consider moving this to GutenbergEditorPage.
		editorIframe = await gutenbergEditorPage.waitUntilLoaded();
		const pageTemplateModalComponent = new PageTemplateModalComponent( editorIframe, page );
		await pageTemplateModalComponent.selectTemplateCatagory( pageTemplateCategory );
		await pageTemplateModalComponent.selectTemplate( pageTemplateLable );
	} );

	it( 'Template content loads into editor', async function () {
		// @TODO Consider moving this to GutenbergEditorPage.
		await editorIframe.waitForSelector( `text=${ expectedTemplateText }` );
	} );

	it( 'Open setting sidebar', async function () {
		await gutenbergEditorPage.openSettings();
		await gutenbergEditorPage.clickSettingsTab( 'Page' );
	} );

	it( 'Set custom URL slug', async function () {
		await gutenbergEditorPage.setURLSlug( customUrlSlug );
	} );

	// This step is required on mobile, but doesn't hurt anything on desktop, so avoiding conditional.
	it( 'Close settings sidebar', async function () {
		await gutenbergEditorPage.closeSettings();
	} );

	it( 'Publish page', async function () {
		publishedUrl = await gutenbergEditorPage.publish( { visit: true } );
	} );

	it( 'Published URL contains the custom URL slug', async function () {
		expect( publishedUrl.pathname ).toContain( `/${ customUrlSlug }` );
	} );

	it( 'Published page contains template content', async function () {
		// Not a typo, it's the POM page class for a WordPress page. :)
		const publishedPagePage = new PublishedPostPage( page );
		await publishedPagePage.validateTextInPost( expectedTemplateText );
	} );
} );
