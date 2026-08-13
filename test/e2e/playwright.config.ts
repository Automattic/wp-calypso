// Must come before ./lib/pw-base so .env is loaded before
// @automattic/calypso-e2e's env-variables module is evaluated.
import './load-env';
import { envVariables } from '@automattic/calypso-e2e';
import { defineConfig, devices, type ReporterDescription } from 'playwright/test';
import { tags, type CustomOptions } from './lib/pw-base';

// Reads every supported variable so an unsupported value fails here, before the suite starts,
// instead of mid-spec on its first read.
envVariables.validate();

/**
 * Creates a use config object with custom options.
 * This helper exists to provide type safety for our custom Playwright options.
 */
function withCustomOptions< T extends object >( config: T & Partial< CustomOptions > ): T {
	return config as T;
}

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
export default defineConfig( {
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
			name: 'prime-logins',
			testMatch: /prime-logins\.setup\.ts/,
			testDir: './setup',
			// Borrows the `chrome` context so the login carries the e2e user agent suffix the
			// backend expects. The cookies it leaves are per account, not per device, so the
			// mobile project reuses them too.
			use: withCustomOptions( {
				...devices[ 'Desktop Chrome HiDPI' ],
				userAgent: appendE2EUserAgent( devices[ 'Desktop Chrome HiDPI' ].userAgent ),
			} ),
		},
		{
			name: 'chrome',
			dependencies: [ 'mailosaur-usage-check', 'prime-logins' ],
			use: withCustomOptions( {
				...devices[ 'Desktop Chrome HiDPI' ],
				userAgent: appendE2EUserAgent( devices[ 'Desktop Chrome HiDPI' ].userAgent ),
				viewportName: 'desktop',
			} ),
		},
		{
			name: 'mobile',
			dependencies: [ 'mailosaur-usage-check', 'prime-logins' ],
			use: withCustomOptions( {
				...devices[ 'Pixel 7' ],
				userAgent: appendE2EUserAgent( devices[ 'Pixel 7' ].userAgent ),
				viewportName: 'mobile',
			} ),
			grepInvert: new RegExp( tags.DESKTOP_ONLY ),
		},
		{
			name: 'authentication',
			// No 'prime-logins': these specs exercise the login flow itself, so warming
			// the cookie cache would only add wall clock.
			dependencies: [ 'mailosaur-usage-check' ],
			retries: 0,
			testDir: './specs/authentication',
			use: loginBrowserUse,
		},
	],
} );
