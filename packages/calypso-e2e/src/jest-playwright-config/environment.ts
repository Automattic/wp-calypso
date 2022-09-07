import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import {
	AllureReporter,
	AllureRuntime,
	AllureConfig,
} from '@automattic/jest-circus-allure-reporter';
import { EnvironmentContext } from '@jest/environment';
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
	 * @param {Config.ProjectConfig} config Jest configuration.
	 * @param {EnvironmentContext} context Jest execution context.
	 */
	constructor( config: Config.ProjectConfig, context: EnvironmentContext ) {
		super( config );

		this.testFilePath = context.testPath;
		this.testFilename = path.parse( context.testPath ).name;
		this.testArtifactsPath = '';
		this.allure = this.initializeAllureReporter( config );
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
	 * Determine the browser to be used for the spec.
	 *
	 * By default, the browser used is defined in the BROWSER_NAME
	 * environment variable, but at times it may be required to
	 * run tests in a different browser.
	 *
	 * To specify a different browser than default,
	 * use the @browser tag in the docblock.
	 *
	 * Example:
	 *
	 * 	`@browser firefox`
	 */
	async determineBrowser(): Promise< BrowserType > {
		const parsed = parseDocBlock( await fs.readFile( this.testFilePath, 'utf8' ) );
		const defaultBrowser = env.BROWSER_NAME;

		// Parsed docblock can return any one of the following:
		// 	- undefined: if a tag was not found.
		// 	- single string: if only one instance of a tag was found.
		//	- string array: if multiple instances of the tag was found.
		// In this case, we only want to throw if the tag has been defined
		// multiple times.
		if ( parsed.browser && typeof parsed.browser !== 'string' ) {
			throw new Error( 'Multiple browsers defined in docblock.' );
		}

		// If the browser tag was found in the docblock, look for the
		// matches in the supported browsers list.
		// If the browser tag was **not** found, then match based on
		// the default broswser specified in the BROWSER_NAME
		// environment variable.
		const match = supportedBrowsers.find( ( browser ) => {
			return parsed.browser === undefined
				? browser.name() === defaultBrowser.toLowerCase()
				: browser.name() === parsed.browser;
		} );

		if ( ! match ) {
			throw new Error( 'Unsupported browser defined in docblock.' );
		}
		return match;
	}

	/**
	 * Set up the environment.
	 */
	async setup() {
		await super.setup();

		// Determine the browser that should be used for the spec.
		const browserType: BrowserType = await this.determineBrowser();

		// Create folders for test artifacts.
		await fs.mkdir( env.ARTIFACTS_PATH, { recursive: true } );
		this.testArtifactsPath = await fs.mkdtemp(
			path.join( env.ARTIFACTS_PATH, `${ this.testFilename }__${ Date.now() }-` )
		);
		const logFilePath = path.join( this.testArtifactsPath, `${ this.testFilename }.log` );

		// Start the browser.
		const browser = await browserType.launch( {
			...config.launchOptions,
			logger: {
				log: async ( name: string, severity: string, message: string ) => {
					await fs.appendFile(
						logFilePath,
						`${ new Date().toISOString() } ${ process.pid } ${ name } ${ severity }: ${ message }\n`
					);
				},
				isEnabled: ( name ) => name === 'api',
			},
		} );

		// Proxy our E2E browser to bind our custom default context options.
		// We need to it this way because we're not using the first-party Playwright
		// and we can't use the playwright.config.js file.
		// See https://playwright.dev/docs/api/class-testoptions.
		const wpBrowser = new Proxy( browser, {
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

		// Expose browser globally.
		this.global.browser = wpBrowser;
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
				break;
			case 'test_fn_start': {
				// Use `test_fn_start` event instead of `test_start` to filter
				// out hooks.
				// See https://github.com/facebook/jest/blob/main/packages/jest-types/src/Circus.ts#L132-L133
				this.allure?.startTestStep( event.test, state, this.testFilePath );
				// If a test has failed, skip rest of the steps.
				if ( this.failure?.type === 'test' ) {
					event.test.mode = 'skip';
				}
				break;
			}
			case 'test_skip':
				this.allure?.startTestStep( event.test, state, this.testFilePath );
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
				// This will capture events from hooks as well.
				this.allure?.endTestStep();
			}
			case 'run_describe_finish': {
				break;
			}
			case 'teardown': {
				if ( ! this.global.browser ) {
					throw new Error( 'Browser instance unavailable' );
				}
				const contexts = this.global.browser.contexts();

				if ( this.failure ) {
					const artefactFilename = `${ this.testFilename }__${ sanitizeString(
						this.failure.name
					) }`;

					let contextIndex = 0;
					let pageIndex = 0;

					// Save trace, screenshot and video for every open context/page.
					for await ( const context of contexts ) {
						const traceFilePath = path.join(
							this.testArtifactsPath,
							`${ artefactFilename }__${ contextIndex }.zip`
						);

						await context.tracing.stop( { path: traceFilePath } );

						for await ( const page of context.pages() ) {
							const mediaFilePath = path.join(
								this.testArtifactsPath,
								'screenshots', // TODO: Remove / I don't think this subfolder is necessary?
								`${ artefactFilename }__${ contextIndex }-${ pageIndex }`
							);

							await page.screenshot( { path: `${ mediaFilePath }.png` } );
							await page.close(); // Needed before saving video.
							await page.video()?.saveAs( `${ mediaFilePath }.webm` );

							pageIndex++;
						}
						contextIndex++;
					}
				}

				// Delete recorded videos from tmp folder and close all contexts.
				for await ( const context of contexts ) {
					for await ( const page of context.pages() ) {
						await page.close();
						await page.video()?.delete();
					}
					await context.close();
				}

				// Close the browser.
				await this.global.browser.close();
				break;
			}
			case 'run_finish':
				// Wrap up the Allure report for the file.
				this.allure?.endTestFile();
				break;
		}
	}
}

export default JestEnvironmentPlaywright;
