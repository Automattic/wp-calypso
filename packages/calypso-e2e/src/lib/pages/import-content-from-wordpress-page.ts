import { Page } from 'playwright';
import { DataHelper, ImportFileContentPage } from '../..';

/**
 * Represents the Import Content from WordPress page.
 */
export class ImportContentFromWordPressPage {
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
		await this.importFileContentPage.dismissCookieBanner();
	}

	/**
	 * Get the heading for the Import Content from WordPress page.
	 * @returns The heading element for the Import Content from WordPress page.
	 */
	get heading() {
		return this.page.getByRole( 'heading', { name: 'Import content from WordPress' } );
	}
}
