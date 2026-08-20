// Must come before ./lib/pw-base so .env is loaded before
// @automattic/calypso-e2e's env-variables module is evaluated.
import './load-env';
import {
	envVariables,
	getAccountNamesToPrime,
	validateThrottleActions,
	type TestAccountName,
} from '@automattic/calypso-e2e';
import {
	defineConfig,
	devices,
	type PlaywrightTestConfig,
	type PlaywrightTestProject,
	type ReporterDescription,
} from 'playwright/test';
import { primeLoginTitle, tags, type CustomOptions } from './lib/pw-base';

// Reads every supported variable so an unsupported value fails here, before the suite starts,
// instead of mid-spec on its first read.
envVariables.validate();
validateThrottleActions();

type Config = PlaywrightTestConfig< CustomOptions >;
type Project = PlaywrightTestProject< CustomOptions >;

const outputPath = './output';
const reporter: ReporterDescription[] = [
	[ 'junit', { outputFile: `${ outputPath }/results.xml` } ],
	[
		'html',
		{ outputFolder: `${ outputPath }/html`, open: process.env.CI ? 'never' : 'on-failure' },
	],
	[
		'playwright-ctrf-json-reporter',
		{
			outputDir: outputPath,
			outputFile: `ctrf-report-${ Date.now() }.json`,
			branchName: process.env.BRANCH_NAME || '',
			commit: process.env.BUILD_VCS_NUMBER || '',
			appName: process.env.E2E_CTRF_APP_NAME || 'calypso',
			repositoryName: 'Automattic/wp-calypso',
		},
	],
];

if ( process.env.CI ) {
	reporter.push( [ 'list' ] );
}

// All end-to-end tests use a custom user agent containing this string.
const E2E_USER_AGENT_SUFFIX = 'wp-e2e-tests';

const appendE2EUserAgent = ( userAgent: string ) => `${ userAgent } ${ E2E_USER_AGENT_SUFFIX }`;

const desktopUse: NonNullable< Project[ 'use' ] > = {
	...devices[ 'Desktop Chrome HiDPI' ],
	userAgent: appendE2EUserAgent( devices[ 'Desktop Chrome HiDPI' ].userAgent ),
	viewportName: 'desktop',
};

const mobileUse: NonNullable< Project[ 'use' ] > = {
	...devices[ 'Pixel 7' ],
	userAgent: appendE2EUserAgent( devices[ 'Pixel 7' ].userAgent ),
	viewportName: 'mobile',
};

/**
 * A setup project that logs the given accounts in before whatever depends on it runs.
 *
 * `setup/prime-logins.setup.ts` declares one login per known account and this picks them by
 * title: a project filters tests, it cannot generate them, and test files are loaded once for
 * the whole run.
 *
 * It borrows the desktop context so the login carries the e2e user agent suffix the backend
 * expects. The cookies it leaves are per account, not per device, so a mobile project
 * depending on it reuses them.
 */
function primeProject( name: string, accountNames: readonly TestAccountName[] ): Project {
	return {
		name,
		testMatch: /prime-logins\.setup\.ts/,
		testDir: './setup',
		// Titles hold no regex metacharacters. Anchoring on the end of the name keeps one
		// account from selecting another it is a prefix of; the title can be followed by
		// tags, hence the alternative to end-of-string.
		//
		// An empty list primes nothing. It cannot be left to join to '', which is a pattern
		// matching every test: the project would quietly log in as all of them.
		grep: accountNames.length
			? new RegExp(
					accountNames.map( ( account ) => `${ primeLoginTitle( account ) }(?:\\s|$)` ).join( '|' )
			  )
			: /(?!)/,
		use: desktopUse,
	};
}

/**
 * A suite project, preceded by the setup project that primes the accounts its `use` names.
 *
 * The list is read here rather than by a single shared setup project because `config.projects`
 * is not narrowed to the selected projects: at run time a shared one cannot tell which suite
 * pulled it in, and would prime every account every other suite asks for.
 */
function suiteProject(
	suite: Project & { name: string; use: { accountsToPrime: readonly TestAccountName[] } }
): Project[] {
	const primeName = `prime-${ suite.name }`;
	return [
		primeProject( primeName, suite.use.accountsToPrime ),
		{ ...suite, dependencies: [ ...( suite.dependencies ?? [] ), primeName ] },
	];
}

/**
 * Fails the run when accounts are named where nothing primes them. `accountsToPrime` is an
 * option on every `use`, shared or per project, but only `suiteProject` acts on it, so setting
 * it anywhere else would type-check and quietly do nothing.
 */
function checkAccountsArePrimed( config: Config ): Config {
	if ( config.use?.accountsToPrime?.length ) {
		throw new Error(
			'accountsToPrime belongs on a project built with suiteProject(), not on the shared use.'
		);
	}

	for ( const { name, use, dependencies } of config.projects ?? [] ) {
		if ( use?.accountsToPrime?.length && ! dependencies?.includes( `prime-${ name }` ) ) {
			throw new Error(
				`Project '${ name }' names accountsToPrime but nothing primes them. Build it with suiteProject().`
			);
		}
	}

	return config;
}

const loginBrowserUse = {
	...devices[ 'Desktop Chrome HiDPI' ],
	bypassCSP: true,
	launchOptions: {
		args: [
			'--disable-blink-features=AutomationControlled',
			'--disable-features=IsolateOrigins,site-per-process',
		],
		slowMo: 1000,
		env: {},
		// Google OAuth rejects the headless shell as an insecure browser.
		channel: 'chromium',
	},
	// Google OAuth also rejects stale user agents: don't pin `userAgent` here,
	// let the device descriptor track the bundled Chromium.
};

function getWorkers(): number | string {
	if ( process.env.PW_WORKERS ) {
		return parseInt( process.env.PW_WORKERS, 10 );
	}
	return process.env.CI ? '50%' : '100%';
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: Config = {
	testDir: './specs',
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !! process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 1 : 0,
	workers: getWorkers(),
	/* Global timeout for each test */
	timeout: 120000, // 2 minutes
	expect: {
		timeout: 10000, // 10 seconds
	},
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter,
	/* Runs once before the suite, before any worker starts */
	globalSetup: require.resolve( './lib/global-setup' ),
	/* Runs once after the suite, when every worker has finished */
	globalTeardown: require.resolve( './lib/global-teardown' ),
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	outputDir: `${ outputPath }/test-results`,
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		// baseURL: 'http://localhost:3000',
		/* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
		actionTimeout: 10000, // 10 seconds

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
		screenshot: { mode: 'only-on-failure', fullPage: true },
		video: 'retain-on-failure',
	},

	/* Configure projects per device */
	// See https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json */
	projects: [
		{
			name: 'mailosaur-usage-check',
			testMatch: /mailosaur-usage\.setup\.ts/,
			testDir: './setup',
		},
		{
			name: 'throttle-check',
			testMatch: /throttle-check\.setup\.ts/,
			testDir: './setup',
		},
		// Shared by `chrome` and `mobile`, which take their accounts from AUTHENTICATE_ACCOUNTS
		// and the run's own environment rather than from a project.
		primeProject( 'prime-logins', getAccountNamesToPrime() ),
		{
			name: 'chrome',
			dependencies: [ 'mailosaur-usage-check', 'throttle-check', 'prime-logins' ],
			use: desktopUse,
		},
		{
			name: 'mobile',
			dependencies: [ 'mailosaur-usage-check', 'throttle-check', 'prime-logins' ],
			use: mobileUse,
			grepInvert: new RegExp( tags.DESKTOP_ONLY ),
		},
		...suiteProject( {
			name: 'p2',
			testDir: './specs/p2',
			dependencies: [ 'throttle-check' ],
			use: { ...desktopUse, accountsToPrime: [ 'p2User' ] },
		} ),
		...suiteProject( {
			name: 'i18n',
			testDir: './specs/i18n',
			dependencies: [ 'throttle-check' ],
			use: { ...desktopUse, accountsToPrime: [ 'i18nUser' ] },
		} ),
		{
			name: 'authentication',
			// No 'prime-logins': these specs exercise the login flow itself, so warming
			// the cookie cache would only add wall clock.
			dependencies: [ 'mailosaur-usage-check', 'throttle-check' ],
			retries: 0,
			testDir: './specs/authentication',
			use: loginBrowserUse,
		},
	],
};

export default defineConfig< CustomOptions >( checkAccountsArePrimed( config ) );
