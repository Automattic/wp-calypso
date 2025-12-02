import { Page } from 'playwright';
import { DataHelper, ImportFileContentPage } from '../..';

/**
 * Represents the Import Content from Medium page.
 */
export class ImportContentFromMediumPage {
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
	 * Navigates to the import content from Medium page.
	 *
	 * @param siteSlug Site slug.
	 */
	async visit( siteSlug: string ): Promise< void > {
		await this.page.goto(
			DataHelper.getCalypsoURL( 'setup/site-setup/importerMedium', {
				ref: 'wp-admin-importers-list-direct-importer',
				siteSlug,
				isUploadInProgress: 'false',
			} )
		);
		await this.importFileContentPage.dismissCookieBanner();
	}

	/**
	 * Get the heading for the Import Content from Medium page.
	 * @returns The heading element for the Import Content from Medium page.
	 */
	get heading() {
		return this.page.getByRole( 'heading', { name: 'Import content from Medium' } );
	}
}
