import { Page } from 'playwright';

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
	 * 	Uploads a Medium export file via the file input.
	 * @param filePath Path to the Medium export file to upload.
	 */
	async uploadExportFile( filePath: string ): Promise< void > {
		await this.page.locator( 'input[type="file"]' ).setInputFiles( filePath );
	}
}
