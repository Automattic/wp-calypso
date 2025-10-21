import { Page } from 'playwright';
import { DataHelper, ImportFileContentPage } from '../..';

/**
 * Represents the generic Import Content page.
 */
export class ImportContentPage {
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
	 * Get the Substack import button element.
	 * @returns The Substack import button element.
	 */
	get substackImportButton() {
		return this.page.getByRole( 'link', { name: 'Substack' } ); // It's a link, not a button.
	}

	/**
	 * Get the WordPress import button element.
	 * @returns The WordPress import button element.
	 */
	get wordPressImportButton() {
		return this.page.getByRole( 'link', { name: 'WordPress' } ); // It's a link, not a button.
	}

	/**
	 * Get the Squarespace import button element.
	 * @returns The Squarespace import button element.
	 */
	get squarespaceImportButton() {
		return this.page.getByRole( 'button', { name: 'Squarespace' } );
	}

	/**
	 * Get the heading for the Medium import page.
	 * @returns The heading element for the Medium import page.
	 */
	get mediumHeading() {
		return this.page.getByRole( 'heading', { name: 'Medium' } );
	}

	/**
	 * Get the heading for the WordPress import page.
	 * @returns The heading element for the WordPress import page.
	 */
	get wordPressHeading() {
		return this.page.getByRole( 'heading', { name: 'WordPress' } );
	}

	/**
	 * Get the heading for the Squarespace import page.
	 * @returns The heading element for the Squarespace import page.
	 */
	get squarespaceHeading() {
		return this.page.getByRole( 'heading', { name: 'Squarespace' } );
	}
}
