import { Locator, Page } from 'playwright';

// Normal processing takes about 5 s. The budget also covers one WordPress.com database lock wait,
// which stalls an upload for 50 s before the upload carries on.
const UPLOAD_PROCESSING_TIMEOUT = 60 * 1000;

/**
 * Represents the Import File Content page.
 */
export class ImportFileContentPage {
	private page: Page;

	/**
	 * Constructs an instance of the page.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Get the text element indicating the uploaded file is ready to be imported.
	 * @returns The text element indicating the uploaded file is ready to be imported.
	 */
	get yourFileIsReadyText() {
		return this.page.getByText( 'Your file is ready to be imported' );
	}

	/**
	 * Get the Import button element.
	 * @returns The Import button element.
	 */
	get importButton() {
		return this.page.getByRole( 'button', { name: 'Import' } );
	}

	/**
	 * 	Uploads an export file via the file input.
	 * @param filePath Path to the export file to upload.
	 */
	async uploadExportFile( filePath: string ): Promise< void > {
		await this.page.locator( 'input[type="file"][name="exportFile"]' ).setInputFiles( filePath );
	}

	/**
	 * Waits for the step that follows the backend's processing of the uploaded file.
	 * If the page is still processing when the wait ends, the error says the backend is slow,
	 * so the failure isn't mistaken for a Calypso or test bug.
	 * @param nextStep The element shown once the upload is processed.
	 */
	async waitForUploadProcessed( nextStep: Locator ): Promise< void > {
		try {
			await nextStep.waitFor( { timeout: UPLOAD_PROCESSING_TIMEOUT } );
		} catch ( error ) {
			if ( await this.page.getByText( 'Processing uploaded file…' ).isVisible() ) {
				throw new Error(
					`WordPress.com was still processing the uploaded file after ${
						UPLOAD_PROCESSING_TIMEOUT / 1000
					} s. This usually means the backend is slow or stuck (for example, database lock waits on file uploads), not a Calypso or test bug. Check WordPress.com upload health before changing this test.`,
					{ cause: error }
				);
			}
			throw error;
		}
	}

	/**
	 * Dismisses the cookie banner if it's present.
	 */
	async dismissCookieBanner(): Promise< void > {
		const acceptAllButton = this.page.getByRole( 'button', { name: 'Accept all' } );
		if ( await acceptAllButton.isVisible() ) {
			await acceptAllButton.click();
		}
	}
}
