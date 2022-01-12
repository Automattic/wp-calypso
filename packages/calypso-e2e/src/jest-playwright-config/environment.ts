/* eslint-disable require-jsdoc */
import fs from 'fs/promises';
import path from 'path';
import { Context } from 'vm';
import JestEnvironmentNode from 'jest-environment-node';
import { Browser, BrowserContext, BrowserContextOptions, chromium, Page } from 'playwright';
import env from '../env-variables';
import config from './playwright-config';
import type { Config, Circus } from 'jest-environment-node/node_modules/@jest/types';

const sanitizeString = ( text: string ) => {
	return text.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
};

class JestEnvironmentPlaywright extends JestEnvironmentNode {
	private testFilename: string;
	private failure?: {
		type: 'hook' | 'test';
		name: string;
	};

	constructor( config: Config.ProjectConfig, context: Context ) {
		super( config );

		this.testFilename = path.parse( context.testPath ).name;
	}

	/**
	 * Set up the environment.
	 */
	async setup() {
		await super.setup();

		// Start the browser.
		const browser = await chromium.launch( config.launchOptions );

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
						const context = await target.newContext( { ...config.contextOptions, ...options } );

						await context.tracing.start( {
							screenshots: true,
							snapshots: true,
						} );

						return context;
					};
				}

				if ( prop === 'newPage' ) {
					return async function ( options: BrowserContextOptions ): Promise< Page > {
						const page = await target.newPage( { ...config.contextOptions, ...options } );
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
			case 'test_start': {
				// If a test has failed, skip rest of the steps.
				if ( this.failure?.type === 'test' ) {
					event.test.mode = 'skip';
				}
				// If a hook has failed, mark all subsequent test steps as failed.
				// Handling is different compared to test steps because Jest treats
				// failed hooks differently from tests.
				if ( this.failure?.type === 'hook' ) {
					// event.test.mode = 'fail'; // THIS TYPE DOESNT EXIST
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
					// Create folders for failed test artefacts.
					await fs.mkdir( env.ARTIFACTS_PATH, { recursive: true } );
					const subfolderPath = await fs.mkdtemp(
						path.join( env.ARTIFACTS_PATH, `${ this.testFilename }__${ Date.now() }-` )
					);
					const mediaPath = path.join( subfolderPath, 'screenshots' );
					await fs.mkdir( mediaPath );

					const artefactFilename = `${ this.testFilename }__${ sanitizeString(
						this.failure.name
					) }`;

					let contextIndex = 0;
					let pageIndex = 0;

					// Save trace, screenshot and video for every open context/page.
					for await ( const context of contexts ) {
						const traceFilepath = path.join(
							subfolderPath,
							`${ artefactFilename }__${ contextIndex }.zip`
						);

						await context.tracing.stop( { path: traceFilepath } );

						for await ( const page of context.pages() ) {
							const mediaFilepath = path.join(
								mediaPath,
								`${ artefactFilename }__${ contextIndex }-${ pageIndex }`
							);

							await page.screenshot( { path: `${ mediaFilepath }.png` } );
							await page.close(); // Needed before saving video.
							await page.video()?.saveAs( `${ mediaFilepath }.webm` );

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
