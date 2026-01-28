import { defineConfig, devices, type ReporterDescription } from 'playwright/test';
import { tags, type CustomOptions } from './lib/pw-base';

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
			appName: 'calypso',
			repositoryName: 'Automattic/wp-calypso',
		},
	],
];

if ( process.env.CI ) {
	reporter.push( [ 'list' ] );
	reporter.push( [ 'blob' ] );
}

// All end-to-end tests use a custom user agent containing this string.
const E2E_USER_AGENT_SUFFIX = 'wp-e2e-tests';

const appendE2EUserAgent = ( userAgent: string ) => `${ userAgent } ${ E2E_USER_AGENT_SUFFIX }`;

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

	/* Configure projects for major browsers */
	// See https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json */
	projects: [
		{
			name: 'chrome',
			use: withCustomOptions( {
				...devices[ 'Desktop Chrome HiDPI' ],
				userAgent: appendE2EUserAgent( devices[ 'Desktop Chrome HiDPI' ].userAgent ),
				viewportName: 'desktop',
			} ),
		},
		{
			name: 'firefox',
			use: withCustomOptions( {
				...devices[ 'Desktop Firefox' ],
				userAgent: appendE2EUserAgent( devices[ 'Desktop Firefox' ].userAgent ),
				viewportName: 'desktop',
			} ),
		},
		{
			name: 'webkit',
			use: withCustomOptions( {
				...devices[ 'Desktop Safari' ],
				userAgent: appendE2EUserAgent( devices[ 'Desktop Safari' ].userAgent ),
				viewportName: 'desktop',
			} ),
		},
		{
			name: 'pixel',
			use: withCustomOptions( {
				...devices[ 'Pixel 7' ],
				userAgent: appendE2EUserAgent( devices[ 'Pixel 7' ].userAgent ),
				viewportName: 'mobile',
			} ),
			grepInvert: new RegExp( tags.DESKTOP_ONLY ),
		},
		{
			name: 'galaxy',
			use: withCustomOptions( {
				...devices[ 'Galaxy S24' ],
				userAgent: appendE2EUserAgent( devices[ 'Galaxy S24' ].userAgent ),
				viewportName: 'mobile',
			} ),
			grepInvert: new RegExp( tags.DESKTOP_ONLY ),
		},
		{
			name: 'iphone',
			use: withCustomOptions( {
				...devices[ 'iPhone 15 Pro' ],
				userAgent: appendE2EUserAgent( devices[ 'iPhone 15 Pro' ].userAgent ),
				viewportName: 'mobile',
			} ),
			grepInvert: new RegExp( tags.DESKTOP_ONLY ),
		},
		{
			name: 'authentication',
			retries: 0,
			testDir: './specs/authentication',
			use: {
				...devices[ 'Desktop Chrome HiDPI' ],
				bypassCSP: true,
				launchOptions: {
					args: [
						'--disable-blink-features=AutomationControlled',
						'--disable-features=IsolateOrigins,site-per-process',
					],
					slowMo: 1000,
					env: {},
					channel: '',
				},
				userAgent:
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML. like Gecko) Chrome/94.0.4606.61 Safari/537.36',
			},
		},
	],
} );
