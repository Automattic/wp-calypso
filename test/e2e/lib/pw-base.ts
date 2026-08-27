/**
 * Playwright test fixture extension for Calypso E2E tests.
 *
 * This module extends the base Playwright test with custom fixtures and helpers
 * for Calypso E2E testing, including test accounts, page objects, API clients,
 * and environment variables.
 *
 * - Provides fixtures for various test accounts, page objects, and utility classes.
 * - Ensures test accounts have fresh authentication cookies before use.
 * - Integrates Calypso-specific components and helpers for streamlined test authoring.
 *
 * @example
 * ```typescript
 * test('should login and load editor', async ({ pageLogin, pageEditor }) => {
 *   await pageLogin.login('user', 'pass');
 *   await pageEditor.open();
 *   // ...test logic...
 * });
 * ```
 *
 * @see https://playwright.dev/docs/test-fixtures
 */
/* eslint-disable no-empty-pattern */
/*
 * Playwright fixtures pass values to the test via a `use( value )` callback.
 * The `react-hooks/rules-of-hooks` rule misreads every `use(...)` call here as
 * a React Hook invoked outside a component, so disable it for this file — there
 * are no React hooks involved.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import {
	abandonPendingLoginLockWaits,
	AddPeoplePage,
	AdvertisingPage,
	AppleLoginPage,
	BlazeCampaignPage,
	BlockWidgetEditorComponent,
	CartCheckoutPage,
	DashboardMeSidebarComponent,
	DashboardPage,
	DashboardPurchasesPage,
	DashboardSiteDomainsPage,
	DashboardSnackbarComponent,
	DashboardVisibilitySettingsPage,
	DataHelper,
	DomainSearchComponent,
	EditorPage,
	EmailClient,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
	GitHubLoginPage,
	ImportContentFromAnotherPlatformOrFilePage,
	ImportContentFromMediumPage,
	ImportContentFromSquarespacePage,
	ImportContentFromSubstackPage,
	ImportContentFromWordPressPage,
	ImportContentPage,
	ImportContentWordPressQuestionPage,
	ImportLetsFindYourSitePage,
	ImportLetUsMigrateYourSitePage,
	ImportPlansPage,
	IncognitoPage,
	JetpackTrafficPage,
	LaunchCelebrationComponent,
	LoginPage,
	LOHPThemeSignupFlow,
	MarketingPage,
	MediaHelper,
	MeSidebarComponent,
	MyProfilePage,
	NewSiteResponse,
	NoticeComponent,
	PeoplePage,
	PostCheckoutSetupSitePage,
	PreviewComponent,
	PurchasesPage,
	RestAPIClient,
	Secrets,
	SecretsManager,
	SidebarComponent,
	SiteSelectComponent,
	SignupPickPlanPage,
	TestAccount,
	TestAccountName,
	ThemesDetailPage,
	ThemesPage,
	UserSignupPage,
	MyHomePage,
	PlansPage,
	UseADomainIOwnPage,
	SelectItemsComponent,
	THROTTLED_PATH_PATTERN,
	activeThrottleForUrl,
	flushThrottleWrites,
	mayBeThrottled,
	recordResponseThrottle,
	registerThrottleActionHandler,
	throttleActionMessage,
	throttleRefusalBody,
	withDeadline,
} from '@automattic/calypso-e2e';
import {
	test as base,
	expect,
	type BrowserContext,
	type Page,
	type Response,
	type Route,
} from '@playwright/test';
import {
	apiCloseAccount,
	apiWaitForBearerTokenAcceptance,
	apiWaitForEmailVerification,
} from '../specs/shared';
import { useBlackboxTestKeyForCollect } from './blackbox-test-key';
import { snoozeAccountRecoveryInterstitial } from './dashboard-helpers';
import { getAccount } from './get-account';

export type CustomOptions = {
	/**
	 * Viewport name used to configure device-specific behavior in page objects.
	 * Set per-project in playwright.config.ts. Valid values: 'desktop' | 'mobile'.
	 */
	viewportName: string;
};

/**
 * Test accounts exposed as a fixture of the same name, logged in on first use.
 *
 * Two accounts are fixtures without belonging here: `accountGivenByEnvironment`, which
 * resolves at run time, and `accountSMS`, whose 2FA code costs a Mailosaur email only a
 * couple of specs need.
 */
export const fixtureAccounts = {
	accountAtomic: 'atomicUser',
	accountDefaultUser: 'defaultUser',
	accountGutenbergSimple: 'gutenbergSimpleSiteUser',
	accounti18n: 'i18nUser',
	accountP2: 'p2User',
	accountPreRelease: 'calypsoPreReleaseUser',
	accountSimpleSiteFreePlan: 'simpleSiteFreePlanUser',
} as const satisfies Record< string, TestAccountName >;

type AccountFixture = (
	args: { page: Page },
	use: ( account: TestAccount ) => Promise< void >
) => Promise< void >;

const WPCOM_HOST = /^https?:\/\/([^/]*\.)?wordpress\.com(?::\d+)?\//;

// A regular expression, and one object for the life of the module: a route
// matched by a function makes Playwright intercept every request in the context
// and hand it back to Node, and `unroute` finds a pattern by identity.
const BANNED_ENDPOINT = new RegExp(
	`${ WPCOM_HOST.source }.*(?:${ THROTTLED_PATH_PATTERN.source })`,
	'i'
);

// The flush covers a body read and the two tag POSTs a detection makes, which is
// what has to land before a worker exits: a flag whose tag never landed leaves
// its line in a build no peer can find. Charged to the test's own timeout, so it
// must stay well under it and must not fail a spec that had already passed.
const FLUSH_TIMEOUT = 7 * 1000;

/**
 * Records a throttle whenever wpcom rate-limits one of the endpoints the suite
 * depends on, including calls the app makes in the background.
 *
 * Watches the whole context, not one page: a signup popup or a tab a spec opens
 * reaches the same endpoints, and the context reports for all of them.
 *
 * The host and path are filtered first so that only a handful of responses are
 * ever read, and the path comes from detection itself: an endpoint nothing can be
 * concluded about is one whose body is better left unread. Anything from 400 up
 * is read — wpcom refuses these with a 403 or a 429 — and a success only when
 * Calypso asked for the answer to be enveloped, which is how a refusal comes back
 * as a 200. The body is never logged: a failed `/sites/new` carries the
 * credentials of the user it was creating a site for.
 *
 * Recording and refusing, never skipping or failing. This sees every call the
 * app makes, and most of them are ones the test never depended on — a page that
 * renders a domain upsell hits `/domains/suggestions` whatever the test is
 * about. Those calls are answered here while a ban is in force, so a test the
 * ban does not affect goes on passing without spending the endpoint on a request
 * that would be refused. A test that did depend on a banned call has already
 * failed on the answer it got, so the policy belongs at the page objects that
 * make those calls, not here.
 *
 * Returns the teardown for the listener and the route. It drains recording;
 * without it, a worker can exit between detecting a throttle and tagging the
 * build for it.
 */
async function watchForThrottle( context: BrowserContext ): Promise< () => Promise< void > > {
	const pending = new Set< Promise< unknown > >();

	const onResponse = ( response: Response ) => {
		const url = response.url();
		const status = response.status();
		if (
			! WPCOM_HOST.test( url ) ||
			! mayBeThrottled( url ) ||
			( status < 400 && ! /[?&]http_envelope=1/.test( url ) )
		) {
			return;
		}

		const reading = ( async () => {
			try {
				// Whether this is a ban at all is detection's to say: an
				// invalid-domain 400 on `is-available` reaches here too. Recording is
				// all it does; the test's outcome is no business of this listener.
				await recordResponseThrottle( response );
			} catch {
				// Detection never fails a test.
			}
		} )();
		pending.add( reading );
		void reading.finally( () => pending.delete( reading ) );
	};
	context.on( 'response', onResponse );

	// A ban we already know about answers here rather than at wpcom: the call
	// would be refused anyway, and the endpoint has better uses for it. Every
	// other request, banned endpoint or not, falls through to the network.
	const refuseBanned = async ( route: Route ) => {
		const id = activeThrottleForUrl( route.request().url() );
		if ( ! id ) {
			return route.fallback();
		}
		await route.fulfill( {
			status: 429,
			contentType: 'application/json',
			body: throttleRefusalBody( id ),
		} );
	};
	await context.route( BANNED_ENDPOINT, refuseBanned );

	return async () => {
		// Off first: a response arriving while this drains would start a read
		// nothing is waiting for, and print its line into the next test.
		context.off( 'response', onResponse );
		await context.unroute( BANNED_ENDPOINT, refuseBanned ).catch( () => {} );

		// A listener can be mid-read when the test ends, so settle until the set
		// is empty rather than settling a snapshot of it. Raced rather than
		// checked between rounds: this runs inside the test's own timeout, and a
		// lost flag costs a peer build a warning where an overrun costs this
		// build a spec that had already passed.
		// The listeners above, and the writes they and the REST client started:
		// a worker that exits with one in flight leaves the build untagged.
		const drain = ( async () => {
			while ( pending.size ) {
				await Promise.allSettled( [ ...pending ] );
			}
			await flushThrottleWrites();
		} )();
		await withDeadline( drain, FLUSH_TIMEOUT ).catch( () => {} );
	};
}

export const test = base.extend<
	CustomOptions & {
		[ K in keyof typeof fixtureAccounts ]: TestAccount;
	} & {
		_abandonLoginLockWaits: void;
		_throttleActionHandler: void;
		/**
		 * Test account selected based on the current environment variables.
		 */
		accountGivenByEnvironment: TestAccount;
		/**
		 * Test account used for SMS-based 2FA.
		 */
		accountSMS: TestAccount;
		/**
		 * Client for interacting with emails during tests.
		 */
		clientEmail: EmailClient;
		/**
		 * Client for interacting with the WordPress.com REST API.
		 */
		clientRestAPI: RestAPIClient;
		/**
		 * Component for interacting with the block widget editor.
		 */
		componentBlockWidgetEditor: BlockWidgetEditorComponent;
		/**
		 * Component for interacting with the preview functionality.
		 */
		componentPreview: PreviewComponent;
		/**
		 * Component for interacting with the sidebar functionality.
		 */
		componentSidebar: SidebarComponent;
		/**
		 * Component for interacting with the site selection functionality.
		 */
		componentSiteSelect: SiteSelectComponent;
		/**
		 * Component for searching/selecting domains during signup flows.
		 */
		componentDomainSearch: DomainSearchComponent;
		/**
		 * Component for the Multi-site Dashboard `/me` sidebar (profile/settings).
		 */
		componentDashboardMeSidebar: DashboardMeSidebarComponent;
		/**
		 * Component for the Multi-site Dashboard snackbar notices.
		 */
		componentDashboardSnackbar: DashboardSnackbarComponent;
		/**
		 * Component for the Me sidebar (profile/settings)
		 */
		componentMeSidebar: MeSidebarComponent;
		/**
		 * Component for displaying notices (e.g., success/error messages).
		 */
		componentNotice: NoticeComponent;
		/**
		 * Component for selecting items in various flows.
		 */
		componentSelectItems: SelectItemsComponent;
		/**
		 * Component for asserting the site launch celebration modal.
		 */
		componentLaunchCelebration: LaunchCelebrationComponent;
		/**
		 * Environment variables for the tests.
		 */
		environment: typeof envVariables;
		/**
		 * Flow encapsulating the LOHP Theme Signup onboarding process.
		 */
		flowLOHPThemeSignup: LOHPThemeSignupFlow;
		/**
		 * Helper data and utilities for tests.
		 */
		helperData: typeof DataHelper;
		/**
		 * Helper for media-related tasks in tests.
		 */
		helperMedia: typeof MediaHelper;
		/**
		 * Page object representing the WordPress.com Advertising page.
		 */
		pageAdvertising: AdvertisingPage;
		/**
		 * Page object representing the Apple login page.
		 */
		pageAppleLogin: AppleLoginPage;
		/**
		 * Page object representing the Blaze campaign page.
		 */
		pageBlazeCampaign: BlazeCampaignPage;
		/**
		 * Page object representing the WordPress.com dashboard.
		 */
		pageDashboard: DashboardPage;
		/**
		 * Page object representing a single site's Domains screen (`/sites/:slug/domains`) in the WordPress.com dashboard.
		 */
		pageDashboardSiteDomains: DashboardSiteDomainsPage;
		/**
		 * Page object representing the cart checkout page.
		 */
		pageCartCheckout: CartCheckoutPage;
		/**
		 * Page object representing the WordPress.com dashboard visibility settings page.
		 */
		pageDashboardVisibilitySettings: DashboardVisibilitySettingsPage;
		/**
		 * Page object representing the WordPress editor page.
		 */
		pageEditor: EditorPage;
		/**
		 * Page object representing the signup plan picker page.
		 */
		pageSignupPickPlan: SignupPickPlanPage;
		/**
		 * Page object representing the Github login page.
		 */
		pageGitHubLogin: GitHubLoginPage;
		/**
		 * Page object representing the Import Content page.
		 */
		pageImportContent: ImportContentPage;
		/**
		 * Page object representing the Import Plans page.
		 */
		pageImportPlans: ImportPlansPage;
		/**
		 * Page object representing the Import Content from Medium page.
		 */
		pageImportContentFromMedium: ImportContentFromMediumPage;
		/**
		 * Page object representing the Import Content from Squarespace page.
		 */
		pageImportContentFromSquarespace: ImportContentFromSquarespacePage;
		/**
		 * Page object representing the Import Content from Substack page.
		 */
		pageImportContentFromSubstack: ImportContentFromSubstackPage;
		/**
		 * Page object representing the Import Content from WordPress page.
		 */
		pageImportContentFromWordPress: ImportContentFromWordPressPage;
		/**
		 * Page object representing the Import Content WordPress Question page.
		 */
		pageImportContentWordpressQuestion: ImportContentWordPressQuestionPage;
		/**
		 * Page object representing the Import Content from Another Platform or File page.
		 */
		pageImportContentFromAnotherPlatformOrFile: ImportContentFromAnotherPlatformOrFilePage;
		/**
		 * Page object representing the Let's Find Your Site page for importing content.
		 */
		pageImportLetsFindYourSite: ImportLetsFindYourSitePage;
		/**
		 * Page object representing the Let Us Migrate Your Site page for importing content.
		 */
		pageImportLetUsMigrateYourSite: ImportLetUsMigrateYourSitePage;
		/**
		 * Playwright `Page` representing an incognito browser context with no signed in state.
		 */
		pageIncognito: IncognitoPage;
		/**
		 * Page object representing the Jetpack Traffic Page
		 */
		pageJetpackTraffic: JetpackTrafficPage;
		/**
		 * Page object representing the WordPress.com login page.
		 */
		pageLogin: LoginPage;
		/**
		 * Page object representing the WordPress.com marketing page.
		 */
		pageMarketing: MarketingPage;
		/**
		 * Page object representing the WordPress.com My Profile page.
		 */
		pageMyProfile: MyProfilePage;
		/**
		 * Page object representing the WordPress.com Add People page.
		 */
		pageAddPeople: AddPeoplePage;
		/**
		 * Page object representing the WordPress.com My Home page.
		 */
		pageMyHome: MyHomePage;
		/**
		 * Page object representing the WordPress.com People management page.
		 */
		pagePeople: PeoplePage;
		/**
		 * Page object representing the WordPress.com plans page.
		 */
		pagePlans: PlansPage;
		/**
		 * Page object representing the post-checkout "Set up your site" choice screen.
		 */
		pagePostCheckoutSetupSite: PostCheckoutSetupSitePage;
		/**
		 * Page object representing the WordPress.com purchases page.
		 */
		pagePurchases: PurchasesPage;
		/**
		 * Page object representing the Multi-site Dashboard Billing > Active upgrades screens.
		 */
		pageDashboardPurchases: DashboardPurchasesPage;
		/**
		 * Page object representing the WordPress.com themes detail page.
		 */
		pageThemeDetails: ThemesDetailPage;
		/**
		 * Page object representing the WordPress.com themes listing page.
		 */
		pageThemes: ThemesPage;
		/**
		 * Page object representing the Use A Domain I Already Own page.
		 */
		pageUseADomainIAlreadyOwn: UseADomainIOwnPage;
		/**
		 * Page object representing the WordPress.com user signup page.
		 */
		pageUserSignUp: UserSignupPage;
		/**
		 * Secrets needed for end-to-end tests.
		 */
		secrets: Secrets;
		/**
		 * Creates a new site with public visibility for testing.
		 */
		sitePublic: NewSiteResponse;
		/**
		 * Like `sitePublic`, but reuses a persistent, already-verified account and
		 * only creates an ephemeral site: no signup or email-verification round trip.
		 */
		sitePublicShared: NewSiteResponse;
	}
>( {
	viewportName: [ 'desktop', { option: true } ],
	_abandonLoginLockWaits: [
		async ( {}, use ) => {
			await use();
			// A timed-out test's await is abandoned, not cancelled, so a withLoginLock call it
			// left waiting would keep polling and could take the lock during worker teardown.
			// Any teardown running means the test body is over: a wait still pending belongs to
			// no live test, so abandoning it here cannot fail one.
			abandonPendingLoginLockWaits();
		},
		{ auto: true },
	],
	_throttleActionHandler: [
		async ( {}, use, testInfo ) => {
			const unregister = registerThrottleActionHandler( ( action, ids ) => {
				const message = throttleActionMessage( action, ids, testInfo );
				// Nothing to say to a test that already stopped for a reason of its own.
				if ( ! message ) {
					return;
				}
				if ( action === 'skip' ) {
					base.skip( true, message );
					return;
				}
				throw new Error( message );
			} );

			try {
				await use();
			} finally {
				unregister();
			}
		},
		{ auto: true },
	],
	page: async ( { page, viewportName }, use, testInfo ) => {
		// Set process.env.VIEWPORT_NAME so page objects/components can access it via envVariables.
		process.env.VIEWPORT_NAME = viewportName;
		await page.context().addCookies( [
			{
				name: 'sensitive_pixel_options',
				value: '{"ok":true,"buckets":{"essential":true,"analytics":false,"advertising":false}}',
				domain: '.wordpress.com',
				path: '/',
			},
		] );

		if ( testInfo.project.name === 'authentication' ) {
			await useBlackboxTestKeyForCollect( page );
		}

		const flushThrottleWatchers = await watchForThrottle( page.context() );

		await use( page );

		await flushThrottleWatchers();
	},
	...( Object.fromEntries(
		Object.entries( fixtureAccounts ).map( ( [ fixtureName, accountName ] ) => [
			fixtureName,
			async ( { page }, use ) => {
				const testAccount = await getAccount( page, accountName );
				await use( testAccount );
			},
		] )
	) as Record< keyof typeof fixtureAccounts, AccountFixture > ),
	accountGivenByEnvironment: async ( { page }, use ) => {
		const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );
		const testAccount = await getAccount( page, accountName );
		await use( testAccount );
	},
	accountSMS: async ( { page }, use ) => {
		const testAccount = await getAccount( page, 'smsUser' );
		await use( testAccount );
	},
	clientEmail: async ( {}, use ) => {
		const emailClient = new EmailClient();
		await use( emailClient );
	},
	clientRestAPI: async ( { accountGivenByEnvironment }, use ) => {
		const restAPIClient = new RestAPIClient( accountGivenByEnvironment.credentials );
		await use( restAPIClient );
	},
	componentBlockWidgetEditor: async ( { page }, use ) => {
		const blockWidgetEditorComponent = new BlockWidgetEditorComponent( page );
		await use( blockWidgetEditorComponent );
	},
	componentDashboardMeSidebar: async ( { page }, use ) => {
		const dashboardMeSidebarComponent = new DashboardMeSidebarComponent( page );
		await use( dashboardMeSidebarComponent );
	},
	componentDashboardSnackbar: async ( { page }, use ) => {
		const dashboardSnackbarComponent = new DashboardSnackbarComponent( page );
		await use( dashboardSnackbarComponent );
	},
	componentMeSidebar: async ( { page }, use ) => {
		const meSidebarComponent = new MeSidebarComponent( page );
		await use( meSidebarComponent );
	},
	componentNotice: async ( { page }, use ) => {
		const noticeComponent = new NoticeComponent( page );
		await use( noticeComponent );
	},
	componentPreview: async ( { page }, use ) => {
		const previewComponent = new PreviewComponent( page );
		await use( previewComponent );
	},
	componentSelectItems: async ( { page }, use ) => {
		const selectItemsComponent = new SelectItemsComponent( page );
		await use( selectItemsComponent );
	},
	componentLaunchCelebration: async ( { page }, use ) => {
		const launchCelebrationComponent = new LaunchCelebrationComponent( page );
		await use( launchCelebrationComponent );
	},
	componentSidebar: async ( { page }, use ) => {
		const sidebarComponent = new SidebarComponent( page );
		await use( sidebarComponent );
	},
	componentSiteSelect: async ( { page }, use ) => {
		const siteSelectComponent = new SiteSelectComponent( page );
		await use( siteSelectComponent );
	},
	componentDomainSearch: async ( { page }, use ) => {
		const domainSearchComponent = new DomainSearchComponent( page );
		await use( domainSearchComponent );
	},
	environment: async ( {}, use ) => {
		await use( envVariables );
	},
	flowLOHPThemeSignup: async ( { page }, use ) => {
		const lohpThemeSignupFlow = new LOHPThemeSignupFlow( page );
		await use( lohpThemeSignupFlow );
	},
	helperData: async ( {}, use ) => {
		await use( DataHelper );
	},
	helperMedia: async ( {}, use ) => {
		await use( MediaHelper );
	},
	pageBlazeCampaign: async ( { page }, use ) => {
		const blazeCampaignPage = new BlazeCampaignPage( page );
		await use( blazeCampaignPage );
	},
	pageAdvertising: async ( { page }, use ) => {
		const advertisingPage = new AdvertisingPage( page );
		await use( advertisingPage );
	},
	pageAppleLogin: async ( { page }, use ) => {
		const appleLoginPage = new AppleLoginPage( page );
		await use( appleLoginPage );
	},
	pageDashboard: async ( { page }, use ) => {
		const dashboardPage = new DashboardPage( page );
		await use( dashboardPage );
	},
	pageDashboardSiteDomains: async ( { page }, use ) => {
		const dashboardSiteDomainsPage = new DashboardSiteDomainsPage( page );
		await use( dashboardSiteDomainsPage );
	},
	pageCartCheckout: async ( { page }, use ) => {
		const cartCheckoutPage = new CartCheckoutPage( page );
		await use( cartCheckoutPage );
	},
	pageDashboardVisibilitySettings: async ( { page }, use ) => {
		const dashboardVisibilitySettingsPage = new DashboardVisibilitySettingsPage( page );
		await use( dashboardVisibilitySettingsPage );
	},
	pageEditor: async ( { page }, use ) => {
		const editorPage = new EditorPage( page );
		await use( editorPage );
	},
	pageSignupPickPlan: async ( { page }, use ) => {
		const signupPickPlanPage = new SignupPickPlanPage( page );
		await use( signupPickPlanPage );
	},
	pageGitHubLogin: async ( { page }, use ) => {
		const gitHubLoginPage = new GitHubLoginPage( page );
		await use( gitHubLoginPage );
	},
	pageImportContent: async ( { page }, use ) => {
		const importContentPage = new ImportContentPage( page );
		await use( importContentPage );
	},
	pageImportContentFromAnotherPlatformOrFile: async ( { page }, use ) => {
		const importContentFromAnotherPlatformOrFilePage =
			new ImportContentFromAnotherPlatformOrFilePage( page );
		await use( importContentFromAnotherPlatformOrFilePage );
	},
	pageImportContentFromMedium: async ( { page }, use ) => {
		const importContentFromMediumPage = new ImportContentFromMediumPage( page );
		await use( importContentFromMediumPage );
	},
	pageImportContentFromSquarespace: async ( { page }, use ) => {
		const importContentFromSquarespacePage = new ImportContentFromSquarespacePage( page );
		await use( importContentFromSquarespacePage );
	},
	pageImportContentFromSubstack: async ( { page }, use ) => {
		const importContentFromSubstackPage = new ImportContentFromSubstackPage( page );
		await use( importContentFromSubstackPage );
	},
	pageImportContentFromWordPress: async ( { page }, use ) => {
		const importContentFromWordPressPage = new ImportContentFromWordPressPage( page );
		await use( importContentFromWordPressPage );
	},
	pageImportLetsFindYourSite: async ( { page }, use ) => {
		const letsFindYourSitePage = new ImportLetsFindYourSitePage( page );
		await use( letsFindYourSitePage );
	},
	pageImportLetUsMigrateYourSite: async ( { page }, use ) => {
		const importLetUsMigrateYourSitePage = new ImportLetUsMigrateYourSitePage( page );
		await use( importLetUsMigrateYourSitePage );
	},
	pageImportPlans: async ( { page }, use ) => {
		const importPlansPage = new ImportPlansPage( page );
		await use( importPlansPage );
	},
	pageImportContentWordpressQuestion: async ( { page }, use ) => {
		const importContentWordpressQuestionPage = new ImportContentWordPressQuestionPage( page );
		await use( importContentWordpressQuestionPage );
	},
	pageIncognito: async ( { browser }, use ) => {
		const incognitoPage = new IncognitoPage( browser );
		await incognitoPage.spawn();
		const flushThrottleWatchers = await watchForThrottle( incognitoPage.getPage().context() );
		await use( incognitoPage );
		await flushThrottleWatchers();
		await incognitoPage.close();
	},
	pageJetpackTraffic: async ( { page }, use ) => {
		const jetpackTrafficPage = new JetpackTrafficPage( page );
		await use( jetpackTrafficPage );
	},
	pageLogin: async ( { page }, use ) => {
		const loginPage = new LoginPage( page );
		await use( loginPage );
	},
	pageMarketing: async ( { page }, use ) => {
		const marketingPage = new MarketingPage( page );
		await use( marketingPage );
	},
	pageMyHome: async ( { page }, use ) => {
		const myHomePage = new MyHomePage( page );
		await use( myHomePage );
	},
	pageMyProfile: async ( { page }, use ) => {
		const myProfilePage = new MyProfilePage( page );
		await use( myProfilePage );
	},
	pageAddPeople: async ( { page }, use ) => {
		const addPeoplePage = new AddPeoplePage( page );
		await use( addPeoplePage );
	},
	pagePeople: async ( { page }, use ) => {
		const peoplePage = new PeoplePage( page );
		await use( peoplePage );
	},
	pagePlans: async ( { page }, use ) => {
		const plansPage = new PlansPage( page );
		await use( plansPage );
	},
	pagePostCheckoutSetupSite: async ( { page }, use ) => {
		const postCheckoutSetupSitePage = new PostCheckoutSetupSitePage( page );
		await use( postCheckoutSetupSitePage );
	},
	pagePurchases: async ( { page }, use ) => {
		const purchasesPage = new PurchasesPage( page );
		await use( purchasesPage );
	},
	pageDashboardPurchases: async ( { page }, use ) => {
		const dashboardPurchasesPage = new DashboardPurchasesPage( page );
		await use( dashboardPurchasesPage );
	},
	pageThemeDetails: async ( { page }, use ) => {
		const themesDetailPage = new ThemesDetailPage( page );
		await use( themesDetailPage );
	},
	pageThemes: async ( { page }, use ) => {
		const themesPage = new ThemesPage( page );
		await use( themesPage );
	},
	pageUseADomainIAlreadyOwn: async ( { page }, use ) => {
		const useADomainIOwnPage = new UseADomainIOwnPage( page );
		await use( useADomainIOwnPage );
	},
	pageUserSignUp: async ( { page }, use ) => {
		const userSignupPage = new UserSignupPage( page );
		await use( userSignupPage );
	},
	secrets: async ( {}, use ) => {
		const secrets = SecretsManager.secrets;
		await use( secrets );
	},
	sitePublic: async ( { page, clientEmail, helperData, pageLogin, pageUserSignUp }, use ) => {
		const testUser = helperData.getNewTestUser( { useMailosaur: true } );
		const siteName = helperData.getBlogName();
		await pageLogin.visit();
		await pageLogin.clickCreateNewAccount();
		const newUserDetails = await pageUserSignUp.signupSocialFirstWithEmail( testUser.email );
		const restAPIClient = new RestAPIClient(
			{ username: testUser.username, password: testUser.password },
			newUserDetails.body.bearer_token
		);
		// The account exists from this point on: any throw in the remaining setup
		// would skip a teardown placed after `use()` and leak the test user (and
		// the site, once created). The try/finally attempts cleanup either way.
		let site: NewSiteResponse | undefined;
		try {
			await apiWaitForBearerTokenAcceptance( restAPIClient, testUser.email );
			site = await restAPIClient.createSite( {
				name: siteName,
				title: siteName,
			} );
			const message = await clientEmail.getLastMatchingMessage( {
				inboxId: testUser.inboxId,
				sentTo: testUser.email,
				subject: 'Activate',
			} );
			const links = await clientEmail.getLinksFromMessage( message );
			const activationLink = links.find( ( link: string ) =>
				link.includes( 'activate' )
			) as string;
			await page.goto( activationLink );
			await apiWaitForEmailVerification( restAPIClient, testUser.email );
			// Fresh accounts have no recovery method set up, so the dashboard's
			// account-recovery interstitial would mount over every route and block
			// specs that load the dashboard with this fixture. Snooze it up front.
			await snoozeAccountRecoveryInterstitial( restAPIClient );
			await use( site );
		} finally {
			if ( site ) {
				try {
					await restAPIClient.deleteSite( {
						id: site.blog_details.blogid,
						domain: site.blog_details.url,
					} );
				} catch ( error ) {
					// Do not throw from the finally: it would mask the error that
					// brought us here. `apiCloseAccount` below also deletes any
					// remaining sites of the user.
					console.warn( `Failed to delete site ${ site.blog_details.url }: ${ error }` );
				}
			}
			// Never throws: errors are caught and logged internally.
			await apiCloseAccount( restAPIClient, {
				userID: newUserDetails.body.user_id,
				username: newUserDetails.body.username,
				email: testUser.email,
			} );
		}
	},
	sitePublicShared: async ( { page, helperData }, use ) => {
		// getAccount persists auth cookies on first login so parallel tests reuse
		// them instead of each re-logging-in; authenticate then loads them onto
		// this test's page (needed by the import navigation).
		const account = await getAccount( page, 'defaultUser' );
		await account.authenticate( page );

		// createSite is the first line that creates a real resource. From here on
		// everything is wrapped so the site is deleted no matter what happens next:
		// the test failing, timing out, or a later line throwing.
		const siteName = helperData.getBlogName();
		const site = await account.restAPI.createSite( { name: siteName, title: siteName } );
		try {
			await use( site );
		} finally {
			await deleteSiteBestEffort( account.restAPI, site );
		}
	},
} );

export const tags = {
	A8C_FOR_AGENCIES: '@a8c-for-agencies',
	AUTHENTICATION: '@authentication',
	CALYPSO_PR: '@calypso-pr',
	CALYPSO_RELEASE: '@calypso-release',
	DASHBOARD_PR: '@dashboard-pr',
	DESKTOP_ONLY: '@desktop-only',
	EDITOR_TRACKING: '@editor-tracking',
	EXAMPLE_BLOCKS: '@example-blocks',
	GUTENBERG: '@gutenberg',
	I18N: '@i18n',
	IMPORTS: '@imports',
	JETPACK_REMOTE_SITE: '@jetpack-remote-site',
	JETPACK_WPCOM_INTEGRATION: '@jetpack-wpcom-integration',
	LEGAL: '@legal',
	P2: '@p2',
	SETTINGS: '@settings',
};

/**
 * Skips the current test suite if Mailosaur daily email limit is reached.
 * Use this at the top of test.describe blocks that use fixtures requiring email verification (e.g., sitePublic).
 *
 * @example
 * ```typescript
 * test.describe( 'My Test Suite', () => {
 *   skipIfMailosaurLimitReached();
 *   test( 'my test', async () => { ... });
 * });
 * ```
 */
export function skipIfMailosaurLimitReached(): void {
	test.skip(
		envVariables.MAILOSAUR_LIMIT_REACHED,
		'Skipping: Mailosaur daily email limit reached (sitePublic fixture requires email verification)'
	);
}

/**
 * Skips the current test suite when not running on trunk.
 *
 * @example
 * ```typescript
 * test.describe( 'My Test Suite', () => {
 *   skipIfNotTrunk();
 *   test( 'my test', async () => { ... });
 * });
 * ```
 */
export function skipIfNotTrunk(): void {
	test.skip( ( process.env.BRANCH_NAME || '' ) !== 'trunk', 'Skipping: run only on trunk' );
}

/**
 * Skips the current test suite when the run does not target a Jetpack deployment site.
 *
 * `wpcom-deployment` is the only value any build type sets, and only it resolves an
 * account owning a site with the Jetpack site features (Instant Search, Subscriptions)
 * some specs need. Every other run resolves an account whose site has none of them —
 * the Calypso PR matrix reaches these specs whenever a shared E2E file change drops
 * its `--grep` and runs the whole suite.
 *
 * @example
 * ```typescript
 * test.describe( 'My Test Suite', () => {
 *   skipIfNotJetpackDeployment();
 *   test( 'my test', async () => { ... });
 * });
 * ```
 */
export function skipIfNotJetpackDeployment(): void {
	test.skip(
		envVariables.JETPACK_TARGET !== 'wpcom-deployment',
		'Skipping: requires a test site with Jetpack features (JETPACK_TARGET=wpcom-deployment)'
	);
}

/**
 * Deletes an ephemeral test site. Retries transient failures and never throws:
 * it runs from fixture teardown, which Playwright executes even when the test
 * fails or times out, so a cleanup hiccup must not redden a passing test. On
 * unrecoverable failure it logs a greppable `LEAKED` line and leaves the site
 * for the external prune rather than masking the test result.
 *
 * @param {RestAPIClient} client Client authenticated as the site owner.
 * @param {NewSiteResponse} site The site to delete.
 */
async function deleteSiteBestEffort(
	client: RestAPIClient,
	site: NewSiteResponse
): Promise< void > {
	const target = { id: site.blog_details.blogid, domain: site.blog_details.url };
	for ( let attempt = 1; attempt <= 3; attempt++ ) {
		let reason: string;
		try {
			// `deleteSite` returns null (without throwing) when it declines to act,
			// e.g. the just-created site is not yet visible in `/all-domains/` so its
			// ownership guard cannot confirm it. Treat that as a retryable failure so
			// the site is not leaked silently.
			if ( await client.deleteSite( target ) ) {
				return;
			}
			reason = 'deletion declined (site ownership not yet confirmable)';
		} catch ( error ) {
			reason = String( error );
		}
		if ( attempt === 3 ) {
			console.warn(
				`LEAKED test site ${ target.domain } (id ${ target.id }): ` +
					`not deleted after ${ attempt } attempts: ${ reason }`
			);
			return;
		}
		await new Promise( ( resolve ) => setTimeout( resolve, 1000 ) );
	}
}

export { expect };
