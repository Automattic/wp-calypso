/**
 * @group calypso-pr
 * @group gutenberg
 */

import {
	DataHelper,
	envVariables,
	TestAccount,
	getTestAccountByFeature,
	envToFeatureKey,
	FullSiteEditorPage,
	SignupPickPlanPage,
	SignupDomainPage,
	NewSiteResponse,
	RestAPIClient,
	StartSiteFlow,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';
import { apiDeleteSite } from '../shared';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Site Editor: Limited Global Styles' ), function () {
	let page: Page;
	let fullSiteEditorPage: FullSiteEditorPage;
	let testAccount: TestAccount;
	let newSiteDetails: NewSiteResponse;
	let siteCreatedFlag = false;

	const features = envToFeatureKey( envVariables );
	const accountName = getTestAccountByFeature( features );

	beforeAll( async () => {
		page = await browser.newPage();

		testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );

		fullSiteEditorPage = new FullSiteEditorPage( page, { target: features.siteType } );
	} );

	describe( 'Create site', function () {
		it( 'Navigate to /start', async function () {
			await page.goto( DataHelper.getCalypsoURL( 'start' ) );
		} );

		it( 'Skip domain selection', async function () {
			const signupDomainPage = new SignupDomainPage( page );
			await signupDomainPage.skipDomainSelection();
		} );

		it( `Select WordPress.com Free plan`, async function () {
			const signupPickPlanPage = new SignupPickPlanPage( page );
			newSiteDetails = await signupPickPlanPage.selectPlan( 'Free' );

			siteCreatedFlag = true;
		} );

		it( 'Skip to dashboard', async function () {
			const startSiteFlow = new StartSiteFlow( page );
			await Promise.all( [
				page.waitForNavigation( { url: /.*\/home\/.*/ } ),
				startSiteFlow.clickButton( 'Skip to dashboard' ),
			] );
		} );
	} );

	describe( 'Check Limited Global Styles upgrade flows', function () {
		it( 'Visit the site editor', async function () {
			await fullSiteEditorPage.visit( newSiteDetails.blog_details.site_slug );
			await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );
		} );

		it( 'Open site styles', async function () {
			await fullSiteEditorPage.openSiteStyles();
		} );

		it( 'Select the "Try it out" option in the upgrade modal', async function () {
			await fullSiteEditorPage.tryGlobalStyles();
		} );

		it( 'Update the global background color', async function () {
			await fullSiteEditorPage.setGlobalColorStyle( 'Background', {
				colorName: 'Primary',
			} );
		} );

		it( 'Save the styles', async function () {
			// On mobile, site styles is a popover panel that blocks the Save button.
			// So let's always close site styles first to be safe. :)
			await fullSiteEditorPage.closeSiteStyles();
			await fullSiteEditorPage.save( { preSaveSelectors: [ '.wpcom-global-styles-notice' ] } );
		} );
	} );

	afterAll( async function () {
		if ( ! siteCreatedFlag ) {
			return;
		}

		const restAPIClient = new RestAPIClient( {
			username: testAccount.credentials.username,
			password: testAccount.credentials.password,
		} );

		await apiDeleteSite( restAPIClient, {
			url: newSiteDetails.blog_details.url,
			id: newSiteDetails.blog_details.blogid,
			name: newSiteDetails.blog_details.blogname,
		} );
	} );
} );
