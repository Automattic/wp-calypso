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

		// Start the browser
		const browser = await chromium.launch( {
			args: [ '--window-position=0,0' ],
			headless: process.env.HEADLESS === 'true',
			slowMo: process.env.SLOWMO && Number( process.env.SLOWMO ),
		} );

		// Create a helper for creating new contexts with our custom options
		const newContext = async ( options = {} ) => {
			const context = await browser.newContext( {
				...options,
				userAgent: `Mozilla/5.0 (wp-e2e-tests) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ browser.version() } Safari/537.36`,
				recordVideo: { dir: os.tmpdir() },
			} );

			await context.tracing.start( {
				screenshots: true,
				snapshots: true,
			} );

			return context;
		};

		// Initiate new context and page
		const context = await newContext();
		const page = await context.newPage();

		// Expose globally
		this.global.browser = browser;
		this.global.context = context;
		this.global.page = page;
		this.global.newContext = newContext;
	}

	/**
	 * Handle events emitted by jest-circus.
	 */
	async handleTestEvent( event ) {
		switch ( event.name ) {
			case 'test_start': {
				// If a test has failed, skip rest of the steps.
				if ( this.failure?.type === 'hook' ) {
					event.test.mode = 'fail';
				}
				// If a hook has failed, mark all subsequent test steps as failed.
				// Handling is different compared to test steps because Jest treats
				// failed hooks differently from tests.
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
				const contexts = this.global.browser.contexts();

				if ( this.failure ) {
					// Create artefacts folder
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

					// Save trace, screenshot and video artefacts for every open page
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
							await page.close();
							await page.video()?.saveAs( `${ mediaFilepath }.webm` );

							pageIndex++;
						}
						contextIndex++;
					}
				}

				// Delete videos from tmp folder
				for await ( const context of contexts ) {
					for await ( const page of context.pages() ) {
						await page.close();
						await page.video().delete();
					}
					await context.close();
				}

				await this.global.browser.close();
				break;
			}
		}
	}
}

export default JestEnvironmentE2E;
