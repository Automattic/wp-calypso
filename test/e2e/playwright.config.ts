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
	console.log( 'Running in CI, adding list reporter.' );
	reporter.push( [ 'list' ] );
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
	/* Workers should use what is available */
	workers: 1,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter,
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	outputDir: `${ outputPath }/test-results`,
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		// baseURL: 'http://localhost:3000',

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
	],
} );
