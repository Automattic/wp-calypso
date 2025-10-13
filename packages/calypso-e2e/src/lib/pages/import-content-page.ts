import { Page } from 'playwright';
import { DataHelper } from '../..';

/**
 * Represents the Import Content page.
 */
export class ImportContentPage {
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
	 * Navigates to the import content from Medium page.
	 *
	 * @param siteSlug Site slug.
	 */
	async visit( siteSlug: string ): Promise< void > {
		await this.page.goto( DataHelper.getCalypsoURL( `import/${ siteSlug }` ) );
	}

	/**
	 * Get the heading for the Import Content page.
	 * @returns The heading element for the Import Content page.
	 */
	get heading() {
		return this.page.getByRole( 'heading', { name: 'Import Content' } );
	}

	/**
	 * Get the Medium import button element.
	 * @returns The Medium import button element.
	 */
	get mediumImportButton() {
		return this.page.getByRole( 'button', { name: 'Medium' } );
	}

	/**
	 * Get the heading for the Medium import page.
	 * @returns The heading element for the Medium import page.
	 */
	get mediumHeading() {
		return this.page.getByRole( 'heading', { name: 'Medium' } );
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
		await this.page.locator( 'input[type="file"][name="exportFile"]' ).setInputFiles( filePath );
	}
}
