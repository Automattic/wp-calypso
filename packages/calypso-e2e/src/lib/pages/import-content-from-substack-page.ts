import { Page } from 'playwright';
import { DataHelper, ImportFileContentPage } from '../..';

// The backend converts the uploaded export asynchronously and the page only learns the outcome
// from a periodic status poll; the conversion took up to ~10s in CI. Same budget as the other importers.
const CONVERSION_SUMMARY_TIMEOUT = 30 * 1000;

/**
 * Represents the Import Content from Substack page.
 */
export class ImportContentFromSubstackPage {
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
	 * Navigates to the import content from Substack page.
	 *
	 * @param siteSlug Site slug.
	 */
	async visit( siteSlug: string ): Promise< void > {
		await this.page.goto(
			DataHelper.getCalypsoURL( 'setup/site-setup/importerSubstack', {
				ref: 'wp-admin-importers-list-direct-importer',
				siteSlug,
			} )
		);
		await this.importFileContentPage.dismissCookieBanner();
	}

	/**
	 * Get the heading for the Import Content your newsletter page.
	 * @returns The heading element for the Import your newsletter page.
	 */
	get newsLetterHeading() {
		return this.page.getByRole( 'heading', { name: 'Import your newsletter' } );
	}

	/**
	 * Get the heading for the Import Content your newsletter page.
	 * @returns The heading element for the Import your newsletter page.
	 */
	get importContentHeading() {
		return this.page.getByRole( 'heading', { name: 'Import content from Substack' } );
	}

	/**
	 * Gets the heading for the Conversion summary section.
	 */
	get conversionSummaryHeading() {
		return this.page.getByRole( 'heading', { name: 'Conversion summary' } );
	}

	/**
	 * Waits for the conversion summary that follows the asynchronous upload processing.
	 */
	async waitForConversionSummary(): Promise< void > {
		await this.conversionSummaryHeading.waitFor( { timeout: CONVERSION_SUMMARY_TIMEOUT } );
	}

	/**
	 * Gets the heading for the Author mapping section.
	 */
	get authorMappingHeading() {
		return this.page.getByRole( 'heading', { name: 'Author mapping' } );
	}

	/**
	 * Get the heading for the Import Content page with the site name.
	 * @param siteName The name of the site being imported.
	 * @returns The heading element for the Import Content page with the site name.
	 */
	importHeading( siteName: string ) {
		return this.page.getByRole( 'heading', { name: `Import ${ siteName }` } );
	}

	/**
	 * Enters the Substack site address.
	 * @param url The Substack site URL.
	 */
	async enterSubstackSiteAddressAndContinue( url: string ): Promise< void > {
		await this.page.getByPlaceholder( 'https://example.substack.com' ).fill( url );
		await this.page.getByRole( 'button', { name: 'Continue' } ).click();
	}

	/**
	 * Click the "Check my site" button.
	 */
	async clickCheckMySiteButton(): Promise< void > {
		await this.page.getByRole( 'button', { name: 'Check my site' } ).click();
	}

	/**
	 * Click the "Continue" button.
	 */
	async clickContinue(): Promise< void > {
		await this.page.getByRole( 'button', { name: 'Continue' } ).click();
	}

	/**
	 * Get the processing uploaded file button element.
	 */
	get processingUploadedFileButton() {
		return this.page.getByRole( 'button', { name: 'Processing uploaded file…' } );
	}
}
