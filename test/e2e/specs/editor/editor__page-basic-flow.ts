import {
	DataHelper,
	envVariables,
	EditorPage,
	PublishedPostPage,
	TestAccount,
	PagesPage,
	PageTemplateModalComponent,
	getTestAccountByFeature,
	envToFeatureKey,
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
	let editorPage: EditorPage;
	let editorIframe: Frame;
	let pagesPage: PagesPage;
	let publishedUrl: URL;

	const accountName = getTestAccountByFeature(
		envToFeatureKey( envVariables ),
		// The default accounts for gutenberg+simple are `gutenbergSimpleSiteEdgeUser` for GB edge
		// and `gutenbergSimpleSiteUser` for stable. The criteria below conflicts with the default
		// one that would return the `gutenbergSimpleSiteUser`. We also can't define it as part of
		// the default criteria, and should pass it here, as an override. For this specific function
		// call, `simpleSitePersonalPlanUser` will be retured when gutenberg is stable, and siteType
		// is simple.
		[ { gutenberg: 'stable', siteType: 'simple', accountName: 'simpleSitePersonalPlanUser' } ]
	);

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
		// @TODO Consider moving this to EditorPage.
		await editorPage.waitUntilLoaded();
		const editorIframe = await editorPage.getEditorHandle();
		const pageTemplateModalComponent = new PageTemplateModalComponent( editorIframe, page );
		await pageTemplateModalComponent.selectTemplateCatagory( pageTemplateCategory );
		await pageTemplateModalComponent.selectTemplate( pageTemplateLable );
	} );

	it( 'Template content loads into editor', async function () {
		// @TODO Consider moving this to EditorPage.
		await editorIframe.waitForSelector( `text=${ expectedTemplateText }` );
	} );

	it( 'Open setting sidebar', async function () {
		await editorPage.openSettings();
	} );

	it( 'Set custom URL slug', async function () {
		await editorPage.setURLSlug( customUrlSlug );
	} );

	// This step is required on mobile, but doesn't hurt anything on desktop, so avoiding conditional.
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
		await publishedPagePage.validateTextInPost( expectedTemplateText );
	} );
} );
