import { Page } from 'playwright';
import { DataHelper } from '../..';

/**
 * Represents the Import Content from WordPress page.
 */
export class ImportContentFromWordPressPage {
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
	 * Navigates to the import content from WordPress page.
	 *
	 * @param siteSlug Site slug.
	 */
	async visit( siteSlug: string ): Promise< void > {
		await this.page.goto(
			DataHelper.getCalypsoURL( 'setup/site-setup/importerWordPress', {
				ref: 'wp-admin-importers-list-direct-importer',
				siteSlug,
				isUploadInProgress: 'false',
			} )
		);
	}

	/**
	 * Get the heading for the Import Content from WordPress page.
	 * @returns The heading element for the Import Content from WordPress page.
	 */
	get heading() {
		return this.page.getByRole( 'heading', { name: 'Import content from WordPress' } );
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
	 * 	Uploads a WordPress export file via the file input.
	 * @param filePath Path to the WordPress export file to upload.
	 */
	async uploadExportFile( filePath: string ): Promise< void > {
		await this.page.locator( 'input[type="file"]' ).setInputFiles( filePath );
	}
}
