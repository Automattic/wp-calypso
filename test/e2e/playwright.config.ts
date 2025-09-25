import { defineConfig, devices, type ReporterDescription } from 'playwright/test';

const outputPath = './output';
const reporter: ReporterDescription[] = [
	[ 'junit', { outputFile: `${ outputPath }/results.xml` } ],
	[
		'html',
		{ outputFolder: `${ outputPath }/html`, open: process.env.CI ? 'never' : 'on-failure' },
	],
];

if ( process.env.CI ) {
	reporter.push( [ 'list' ] );
	reporter.push( [ 'blob' ] );
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
	retries: process.env.CI ? 2 : 1,
	/* Workers should use what is available locally, and half on CI*/
	workers: process.env.CI ? '50%' : '100%',
	/* Global timeout for each test */
	timeout: 60 * 1000,
	expect: {
		timeout: 10 * 1000,
	},
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter,
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	outputDir: `${ outputPath }/test-results`,
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		// baseURL: 'http://localhost:3000',
		/* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
		actionTimeout: 10 * 1000,

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'on-first-retry',
	},

	/* Configure projects for major browsers */
	// See https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json */
	projects: [
		{
			name: 'chrome',
			use: { ...devices[ 'Desktop Chrome HiDPI' ] },
		},
		{
			name: 'firefox',
			use: { ...devices[ 'Desktop Firefox' ] },
		},
		{
			name: 'webkit',
			use: { ...devices[ 'Desktop Safari' ] },
		},
		{
			name: 'pixel',
			use: { ...devices[ 'Pixel 7' ] },
		},
		{
			name: 'galaxy',
			use: { ...devices[ 'Galaxy S24' ] },
		},
		{
			name: 'iphone',
			use: { ...devices[ 'iPhone 15 Pro' ] },
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
