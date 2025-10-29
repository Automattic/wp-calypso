import { Page, Locator } from 'playwright';
import { DataHelper, ImportFileContentPage } from '../..';

/**
 * Represents the generic Import Content page.
 */
export class ImportContentPage {
	private page: Page;

	readonly heading: Locator;
	readonly importFileContentPage: ImportFileContentPage;
	readonly mediumHeading: Locator;
	readonly mediumImportButton: Locator;
	readonly squarespaceHeading: Locator;
	readonly squarespaceImportButton: Locator;
	readonly substackImportButton: Locator;
	readonly wordPressHeading: Locator;
	readonly wordPressImportButton: Locator;

	/**
	 * Constructs an instance of the page.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;

		this.heading = this.page.getByRole( 'heading', { name: 'Import Content' } );
		this.importFileContentPage = new ImportFileContentPage( page );
		this.mediumHeading = this.page.getByRole( 'heading', { name: 'Medium' } );
		this.mediumImportButton = this.page.getByRole( 'button', { name: 'Medium' } );
		this.squarespaceHeading = this.page.getByRole( 'heading', { name: 'Squarespace' } );
		this.squarespaceImportButton = this.page.getByRole( 'button', { name: 'Squarespace' } );
		this.substackImportButton = this.page.getByRole( 'link', { name: 'Substack' } ); // It's a link, not a button.
		this.wordPressHeading = this.page.getByRole( 'heading', { name: 'WordPress' } );
		this.wordPressImportButton = this.page.getByRole( 'link', { name: 'WordPress' } ); // It's a link, not a button.
	}

	/**
	 * Navigates to the import content from Medium page.
	 *
	 * @param siteSlug Site slug.
	 */
	async visit( siteSlug: string ): Promise< void > {
		await this.page.goto( DataHelper.getCalypsoURL( `import/${ siteSlug }` ) );
	}
}
