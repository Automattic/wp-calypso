import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import {
	AllureReporter,
	AllureRuntime,
	AllureConfig,
} from '@automattic/jest-circus-allure-reporter';
import { EnvironmentContext, JestEnvironmentConfig } from '@jest/environment';
import { parse as parseDocBlock } from 'jest-docblock';
import NodeEnvironment from 'jest-environment-node';
import {
	Browser,
	BrowserContext,
	BrowserContextOptions,
	BrowserType,
	Page,
	firefox,
	chromium,
} from 'playwright';
import env from '../env-variables';
import config from './playwright-config';
import type { Config, Circus } from '@jest/types';

const sanitizeString = ( text: string ) => {
	return text.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
};
const supportedBrowsers = [ chromium, firefox ];

/**
 * This is the place where we make Playwright work with Jest (jest-circus): From
 * setting up our global Browser instance to handling failure and teardown
 * hooks.
 *
 * Our custom Jest environment adds new behavior and extends existing behavior:
 * 	- determineBrowser: allows the ability to define a custom browser in the test docblock.
 * 	- initializeAllureReporter: set up an instance of Allure reporter if requested.
 * 	- setup: launches an instance of the requested Playwright browser and makes it available under global namespace.
 * 	-
 *
 * This environment also extends teh default event handler to run actions and/or mark statuses.
 * For more information, see the `handleTestEvent` method below.
 *
 * @see {@link https://github.com/facebook/jest/tree/main/packages/jest-circus}
 */
class JestEnvironmentPlaywright extends NodeEnvironment {
	private testFilename: string;
	private testFilePath: string;
	private testArtifactsPath: string;
	private failure?: {
		type: 'hook' | 'test';
		name: string;
	};
	private allure: AllureReporter | undefined;

	/**
	 * Constructs the instance of the JestEnvironmentNode.
	 *
	 * @param config Jest configuration.
	 * @param context Jest execution context.
	 */
	constructor( config: JestEnvironmentConfig, context: EnvironmentContext ) {
		super( config, context );

		this.testFilePath = context.testPath;
		this.testFilename = path.parse( context.testPath ).name;
		// We need the test file name for some ENV var calculation.
		// Set the global value both in the Jest context (the code here)...
		global.testFileName = this.testFilename;
		// ...and pass the global value to the environment running the test code. (What the "this" does here.)
		// Yes, we need to do both!
		this.global.testFileName = this.testFilename;
		this.testArtifactsPath = '';
		this.allure = this.initializeAllureReporter( config.projectConfig );
	}

	/**
	 * Initializes the Allure reporter if required.
	 *
	 * The Allure reporter is initialized only if the `ALLURE_RESULTS_PATH` environment
	 * variable is set to a non-empty string.
	 *
	 * @param {Config.ProjectConfig} config Jest configuration.
	 * @returns {AllureReporter|undefined} Instance of an Allure reporter if required.
	 */
	private initializeAllureReporter( config: Config.ProjectConfig ): AllureReporter | undefined {
		if ( ! env.ALLURE_RESULTS_PATH ) {
			return undefined;
		}
		const allureConfig: AllureConfig = {
			resultsDir: env.ALLURE_RESULTS_PATH,
		};

		return new AllureReporter( {
			allureRuntime: new AllureRuntime( allureConfig ),
			environmentInfo: config.testEnvironmentOptions?.environmentInfo as Record< string, string >,
		} );
	}

	/**
	 * Set up the environment.
	 */
	async setup() {
		await super.setup();

		// Make sure we have valid env variables, and fail early if we don't!
		env.validate();

		// Determine the browser that should be used for the spec.
		const browserType: BrowserType = await determineBrowser( this.testFilePath );

		// Create folders for test artifacts.
		await fs.mkdir( env.ARTIFACTS_PATH, { recursive: true } );
		const date = new Date()
			.toISOString()
			.split( 'Z' )[ 0 ]
			.replace( /[.:+]/g, '-' )
			.replace( 'T', '_' );
		this.testArtifactsPath = await fs.mkdtemp(
			path.join( env.ARTIFACTS_PATH, `${ this.testFilename }__${ date }-` )
		);

		// Start the browser.
		const browser = await browserType.launch( {
			...config.launchOptions,
		} );

		// Set up the proxy trap.
		const wpBrowser = setupBrowserProxyTrap( browser );

		// Expose browser globally.
		this.global.browser = wpBrowser;
	}

	/**
	 * Teardowns the environment.
	 *
	 * If there are any failures noted for the current suite, the teardown
	 * will save the trace, screenshot and replay video to the artifacts
	 * directory.
	 *
	 * The browser is then shut down at the end regardless of failure status.
	 */
	async teardown(): Promise< void > {
		try {
			if ( ! this.global.browser ) {
				throw new Error( 'Browser instance unavailable' );
			}
			const contexts = this.global.browser.contexts();
			if ( this.failure ) {
				let contextIndex = 1;

				// Spec file name and step that filed.
				let artifactPrefix = `${ this.testFilename }__${ sanitizeString( this.failure.name ) }`;

				if ( env.RUN_ID ) {
					artifactPrefix = `${ artifactPrefix }__${ sanitizeString( env.RUN_ID ) }`;
				}

				if ( env.RETRY_COUNT ) {
					artifactPrefix = `${ artifactPrefix }__retry-${ env.RETRY_COUNT }`;
				}

				for await ( const context of contexts ) {
					let pageIndex = 1;
					// Save trace file per page.
					const traceFilePath = path.join(
						this.testArtifactsPath,
						`${ artifactPrefix }__${ contextIndex }.zip`
					);

					// Traces are saved per context.
					await context.tracing.stop( { path: traceFilePath } );

					for await ( const page of context.pages() ) {
						const pageName = `${ artifactPrefix }__${ contextIndex }-${ pageIndex }`;
						// Define artifact filename.
						const mediaFilePath = path.join( this.testArtifactsPath, pageName );

						// Screenshots and video are saved per page, where numerous
						// pages may exist within a context.
						try {
							await page.screenshot( {
								path: `${ mediaFilePath }-fullpage.png`,
								timeout: env.TIMEOUT,
								fullPage: true,
							} );
							await page.screenshot( {
								path: `${ mediaFilePath }.png`,
								timeout: env.TIMEOUT,
							} );
						} catch ( error ) {
							console.error(
								`Error while capturing page (${ pageName }) screenshot. ` +
									'This may mean the page already crashed during test execution. Error: ',
								error
							);
						}

						try {
							// Close the now unnecessary page which also triggers saving
							// of video to the disk.
							await page.close();
							await page.video()?.saveAs( `${ mediaFilePath }.webm` );
						} catch ( error ) {
							console.error(
								`Error while closing page (${ pageName }) and saving video. ` +
									'This may mean the page already crashed during test execution. Error: ',
								error
							);
						}

						pageIndex++;
					}
					contextIndex++;
				}
				// Print paths to captured artifacts for faster triaging.
				console.error( `Artifacts for ${ this.testFilename }: ${ this.testArtifactsPath }` );
			}
			// Regardless of pass/fail status, close the browser instance.
			await this.global.browser.close();
		} catch ( error ) {
			console.error( 'Unexepected error during Jest teardown: ', error );
		}

		await super.teardown();
	}

	/**
	 * Handle events emitted by jest-circus.
	 */
	async handleTestEvent( event: Circus.Event, state: Circus.State ) {
		switch ( event.name ) {
			case 'run_start':
				this.allure?.startTestFile( this.testFilename );
				break;
			case 'run_describe_start': {
				// If failure has been noted in a prior step/describe block, skip
				// all subsequent describe blocks.
				if ( this.failure ) {
					event.describeBlock.mode = 'skip';
				}
				this.allure?.startSuite( event.describeBlock.name );
				break;
			}
			case 'hook_start':
				this.allure?.startHook( event.hook.type );
				break;
			case 'hook_success':
				this.allure?.endHook();
				break;
			case 'hook_failure':
				this.allure?.endHook( event.error ?? event.hook.asyncError );
				this.failure = { type: 'hook', name: event.hook.type };
				// Jest does not treat hook failures as actual failures, so output are
				// suppressed. Manually display the error.
				console.error(
					`ERROR: ${ event.hook.parent.name } > ${ event.hook.type }\n\n`,
					event.error,
					'\n'
				);
				break;
			case 'test_start':
				// This event is fired not only for test steps but also the hooks.
				// Precisely speaking, this event is fired after the `beforeAll` hooks
				// but prior to the `beforeEach` as well.
				// This means that stats for test results will be muddled if any `beforeEach`
				// hooks are present.
				// In addition, the following code snippet is replicated from `test_fn_start`
				// due to https://github.com/Automattic/wp-calypso/pull/70154.
				// Without this snippet, Jest will continue executing test steps within the
				// nested `describe` block despite a failure in an earlier step.
				if ( this.failure?.type === 'test' ) {
					event.test.mode = 'skip';
				}
				break;
			case 'test_fn_start':
				// This event is fired after both the `beforeAll` and `beforeEach` hooks.
				// Since this event fires after `beforeEach` hooks, it is the best way to detect
				// an actual `it/test` step as having started.
				// See https://github.com/facebook/jest/blob/main/packages/jest-types/src/Circus.ts#L132-L133
				this.allure?.startTestStep( event.test, state, this.testFilename );
				// If a test has failed, skip rest of the steps.
				if ( this.failure?.type === 'test' ) {
					event.test.mode = 'skip';
				}
				break;
			case 'test_skip':
				this.allure?.startTestStep( event.test, state, this.testFilename );
				this.allure?.pendingTestStep( event.test );
				break;
			case 'test_fn_success': {
				this.allure?.passTestStep();
				break;
			}
			case 'test_fn_failure': {
				this.failure = { type: 'test', name: event.test.name };
				this.allure?.failTestStep( event.error );
				break;
			}
			case 'test_done': {
				// Event is fired when the test step is complete, including all pre- and
				// after-hooks. Therefore we tell Allure that the test step has completely
				// finished.
				this.allure?.endTestStep();
				break;
			}
			case 'run_describe_finish': {
				break;
			}
			case 'teardown': {
				// Teardown is completed in its own function that runs after the spec is
				// complete.
				break;
			}
			case 'run_finish':
				// Wrap up the Allure report for the file.
				this.allure?.endTestFile();
				break;
		}
	}
}

/**
 * Determine the browser to be used for the spec.
 *
 * By default, the browser used is defined in the BROWSER_NAME
 * environment variable, but at times it may be required to
 * run tests in a different browser.
 *
 * To specify a different browser than default,
 * use the @browser tag in the docblock.
 *
 * Declaration of multiple browsers in the docblock is not supported at this time.
 *
 * Example:
 *
 * 	`@browser firefox`
 */
async function determineBrowser( testFilePath: string ): Promise< BrowserType > {
	const parsed = parseDocBlock( await fs.readFile( testFilePath, 'utf8' ) );

	// Parsed docblock can return any one of the following for the `browser` prop:
	// 	- undefined: if a tag was not found.
	// 	- single string: if only one instance of a tag was found.
	//	- string array: if multiple instances of the tag was found.
	if ( typeof parsed.browser === 'object' ) {
		// Multiple browser declarations are not supported.
		throw new Error( 'Multiple browsers defined in docblock.' );
	} else if ( typeof parsed.browser === 'string' ) {
		// Single browser declaration is supported, but must be a valid browser.
		const browserFromDocblock = supportedBrowsers.find(
			( browser ) => browser.name().toLowerCase() === parsed.browser.toString().toLowerCase()
		);

		if ( ! browserFromDocblock ) {
			throw new Error( `Unsupported browser defined in DocBlock: ${ parsed.browser }` );
		}

		return browserFromDocblock;
	} else {
		// Fall back on the default browser specified in `BROWSER_NAME` environment
		// variable.
		const browserFromEnvironmentVariable = supportedBrowsers.find(
			( browser ) => browser.name().toLowerCase() === env.BROWSER_NAME.toLowerCase()
		);

		if ( ! browserFromEnvironmentVariable ) {
			throw new Error( `Unsupported default browser: ${ env.BROWSER_NAME }` );
		}

		return browserFromEnvironmentVariable;
	}
}

/**
 * Proxy our E2E browser to bind our custom default context options.
 * We need to it this way because we're not using the first-party Playwright
 * and we can't use the playwright.config.js file.
 *
 * @see {@link  https://playwright.dev/docs/api/class-testoptions}
 * @returns {Browser} Proxy-trapped instance of a browser.
 */
function setupBrowserProxyTrap( browser: Browser ): Browser {
	return new Proxy( browser, {
		get: function ( target, prop: keyof Browser ) {
			const orig = target[ prop ];

			if ( typeof orig !== 'function' ) {
				return orig;
			}

			if ( prop === 'newContext' ) {
				return async function ( options: BrowserContextOptions ): Promise< BrowserContext > {
					const context = await target.newContext( {
						...options,
						...config.contextOptions,
						recordVideo: { dir: os.tmpdir() },
					} );

					await context.tracing.start( {
						screenshots: true,
						snapshots: true,
					} );

					return context;
				};
			}

			if ( prop === 'newPage' ) {
				return async function ( options: BrowserContextOptions ): Promise< Page > {
					const page = await target.newPage( {
						...options,
						...config.contextOptions,
						recordVideo: { dir: os.tmpdir() },
					} );

					// Set the default timeout for all Playwright methods.
					// Default value is 15000ms, defined in env-variables.ts.
					page.setDefaultTimeout( env.TIMEOUT );

					// Set up a HTTP response status interceptor
					// to capture instances of 502 Bad Gateway.
					// This remains active until the page is
					// closed.
					page.on( 'response', async ( response ) => {
						if ( response.status() === 502 ) {
							await page.reload();
						}
					} );

					// Add route abort for slow requests on AT sites.
					await page.route( /store\/v1\/cart/, ( route ) => {
						route.abort();
					} );
					await page.route( /rest\/v1\/batch/, ( route ) => {
						route.abort();
					} );
					await page.route( /pubmine/, ( route ) => {
						route.abort();
					} );

					const context = page.context();

					await context.tracing.start( {
						screenshots: true,
						snapshots: true,
					} );

					return page;
				};
			}

			return orig.bind( target );
		},
	} );
}

export default JestEnvironmentPlaywright;
