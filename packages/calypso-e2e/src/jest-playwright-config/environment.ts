import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { Context } from 'vm';
import { parse } from 'jest-docblock';
import JestEnvironmentNode from 'jest-environment-node';
import { Browser, BrowserContext, BrowserContextOptions, chromium, Page } from 'playwright';
import env from '../env-variables';
import config from './playwright-config';
import type { Config, Circus } from '@jest/types';

const sanitizeString = ( text: string ) => {
	return text.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
};

/**
 * This is the place where we make Playwright work with Jest (jest-circus): From
 * setting up our global Browser instance to handling failure and teardown
 * hooks.
 *
 * @see {@link https://github.com/facebook/jest/tree/main/packages/jest-circus}
 */
class JestEnvironmentPlaywright extends JestEnvironmentNode {
	private testFilename: string;
	private testArtifactsPath: string;
	private failure?: {
		type: 'hook' | 'test';
		name: string;
	};

	/**
	 * Constructs the instance of the JestEnvironmentNode.
	 */
	constructor( config: Config.ProjectConfig, context: Context ) {
		super( config );

		this.testFilename = path.parse( context.testPath ).name;
		this.testArtifactsPath = '';
	}

	/**
	 * Set up the environment.
	 */
	async setup() {
		await super.setup();

		// Create folders for test artefacts.
		await fs.mkdir( env.ARTIFACTS_PATH, { recursive: true } );
		this.testArtifactsPath = await fs.mkdtemp(
			path.join( env.ARTIFACTS_PATH, `${ this.testFilename }__${ Date.now() }-` )
		);

		const logFilePath = path.join( this.testArtifactsPath, `${ this.testFilename }.log` );

		// Start the browser.
		const browser = await chromium.launch( {
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
	async handleTestEvent( event: Circus.Event ) {
		switch ( event.name ) {
			case 'run_describe_start': {
				// If failure has been noted in a prior step/describe block, skip
				// all subsequent describe blocks.
				if ( this.failure ) {
					event.describeBlock.mode = 'skip';
				}
				break;
			}
			case 'test_start': {
				// If a test has failed, skip rest of the steps.
				if ( this.failure?.type === 'test' ) {
					event.test.mode = 'skip';
				}
				break;
			}
			case 'hook_failure': {
				this.failure = { type: 'hook', name: event.hook.type };
				break;
			}
			case 'test_fn_failure': {
				this.failure = { type: 'test', name: event.test.name };
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
		}
	}
}

export default JestEnvironmentPlaywright;
