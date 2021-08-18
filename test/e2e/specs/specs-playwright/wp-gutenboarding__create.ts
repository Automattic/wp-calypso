import {
	setupHooks,
	DataHelper,
	LoginFlow,
	GutenbergEditorPage,
	SidebarComponent,
	SiteSelectComponent,
	GutenboardingFlow,
	GeneralSettingsPage,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Gutenboarding: Create' ), function () {
	const siteTitle = DataHelper.getBlogName();

	let siteURL: string;
	let gutenboardingFlow: GutenboardingFlow;
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( 'Log in', async function () {
		const loginFlow = new LoginFlow( page, 'defaultUser' );
		await loginFlow.logIn();
	} );

	it( 'Click on Add Site on Sidebar', async function () {
		const sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.switchSite();
		const siteSelectComponent = new SiteSelectComponent( page );
		await siteSelectComponent.addSite();
	} );

	it( 'Enter new site name', async function () {
		gutenboardingFlow = new GutenboardingFlow( page );
		await gutenboardingFlow.enterSiteTitle( siteTitle );
		await gutenboardingFlow.clickButton( 'Continue' );
	} );

	it( 'Search for and select a WordPress.comdomain name', async function () {
		await gutenboardingFlow.searchDomain( siteTitle );
		siteURL = await gutenboardingFlow.selectDomain( { name: siteTitle, tld: '.wordpress.com' } );
		await gutenboardingFlow.clickButton( 'Continue' );
	} );

	it( 'Select Vesta as the site design', async function () {
		await gutenboardingFlow.selectDesign( 'Vesta' );
	} );

	it( 'Pick the Playfair font pairing', async function () {
		await gutenboardingFlow.selectFont( 'Playfair' );
		await gutenboardingFlow.clickButton( 'Continue' );
	} );

	it( 'Select to add the Plugin feature', async function () {
		await gutenboardingFlow.selectFeatures( [ 'Plugins' ] );
		await gutenboardingFlow.clickButton( 'Continue' );
	} );

	it( 'WordPress.com Business plan is recommended', async function () {
		await gutenboardingFlow.validateRecommendedPlan( 'Business' );
	} );

	it( 'Select free plan', async function () {
		await gutenboardingFlow.selectPlan( 'Free' );
	} );

	it( 'See the Gutenberg editor', async function () {
		const gutenbergEditorPage = new GutenbergEditorPage( page );
		await gutenbergEditorPage.waitUntilLoaded();
	} );

	it( `Delete created site`, async function () {
		const settingsURL = DataHelper.getCalypsoURL( `settings/general/${ siteURL }` );
		await page.goto( settingsURL, { waitUntil: 'load' } );
		const generalSettingsPage = new GeneralSettingsPage( page );
		try {
			await generalSettingsPage.deleteSite( siteURL );
		} catch ( e ) {
			console.error( `Deleting ${ siteURL } failed, manual intervention needed.` );
			throw e;
		}
	} );
} );
