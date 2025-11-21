import { Page } from 'playwright';
import { DataHelper, ImportFileContentPage } from '../..';

/**
 * Represents the Import Content from Squarespace page.
 */
export class ImportContentFromSquarespacePage {
	private page: Page;
	importFileContentPage: ImportFileContentPage;

	/**
	 * Constructs an instance of the page.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.importFileContentPage = new ImportFileContentPage( page );
	}

	/**
	 * Navigates to the import content from Squarespace page.
	 *
	 * @param siteSlug Site slug.
	 */
	async visit( siteSlug: string ): Promise< void > {
		await this.page.goto(
			DataHelper.getCalypsoURL( 'setup/site-setup/importerSquarespace', {
				ref: 'wp-admin-importers-list-direct-importer',
				siteSlug,
			} )
		);
		await this.importFileContentPage.dismissCookieBanner();
	}

	/**
	 * Get the heading for the Import Content from Squarespace page.
	 * @returns The heading element for the Import Content from Squarespace page.
	 */
	get heading() {
		return this.page.getByRole( 'heading', { name: 'Import content from Squarespace' } );
	}
}
