import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import JestEnvironmentNode from 'jest-environment-node';
import { chromium } from 'playwright';

const sanitizeString = ( string ) => {
	return string.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
};

class JestEnvironmentE2E extends JestEnvironmentNode {
	constructor( config, context ) {
		super( config, context );

		this.testFilename = path.parse( context.testPath ).name;
	}

	/**
	 * Set up the environment.
	 */
	async setup() {
		await super.setup();

		// Start the browser.
		const browser = await chromium.launch( {
			args: [ '--window-position=0,0' ],
			headless: process.env.HEADLESS === 'true',
			slowMo: process.env.SLOWMO && Number( process.env.SLOWMO ),
		} );

		// Proxy our E2E browser to bind customized default context options.
		// We need to it this way because we're not using the first-party Playwright
		// Test runner and there's no way to customize the default context options
		// with Jest runner: https://playwright.dev/docs/api/class-testoptions.
		const wpBrowser = new Proxy( browser, {
			get: function ( target, prop ) {
				const orig = target[ prop ];
				if ( 'function' !== typeof orig ) {
					return orig;
				}

				if ( [ 'newContext', 'newPage' ].includes( prop ) ) {
					return async function ( options = {} ) {
						const entity = await orig.apply( target, [
							{
								...options,
								userAgent: `Mozilla/5.0 (wp-e2e-tests) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ browser.version() } Safari/537.36`,
								recordVideo: { dir: os.tmpdir() },
							},
						] );

						const context = prop === 'newPage' ? entity.context() : entity;
						await context.tracing.start( {
							screenshots: true,
							snapshots: true,
						} );

						return entity;
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
	async handleTestEvent( event ) {
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
					event.test.mode = 'fail';
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
				const contexts = this.global.browser.contexts();

				if ( this.failure ) {
					// Create folders for failed test artefacts.
					const resultsPath = path.join( process.cwd(), 'results' );
					await fs.mkdir( resultsPath, { recursive: true } );
					const artefactsPath = await fs.mkdtemp(
						path.join( resultsPath, `${ this.testFilename }__${ Date.now() }-` )
					);
					const mediaPath = path.join( artefactsPath, 'screenshots' );
					await fs.mkdir( mediaPath );

					const artefactFilename = `${ this.testFilename }__${ sanitizeString(
						this.failure.name
					) }`;

					let contextIndex = 0;
					let pageIndex = 0;

					// Save trace, screenshot and video for every open context/page.
					for await ( const context of contexts ) {
						const traceFilepath = path.join(
							artefactsPath,
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
						await page.video().delete();
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

export default JestEnvironmentE2E;
