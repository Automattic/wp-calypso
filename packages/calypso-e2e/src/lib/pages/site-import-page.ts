import { Page } from 'playwright';

export type SourceService = ( typeof SiteImportPage.services )[ number ];

const selectors = {
	// Listing
	service: ( name: SourceService ) => `h1:text("${ name }")`,

	// Importer screen buttons and pseudo-buttons
	backButton: 'a:text("Back")',
	cancelButton: 'button:text("Cancel")',
	continueButton: 'button:text("Continue")',

	// Inputs
	siteInput: '[placeholder="example.com"]',
	fileInput: 'input[name="exportFile"]',
	fileInputText: 'text=Drag a file here, or click to upload a file',
};

/**
 * Class representing the Site Import page.
 */
export class SiteImportPage {
	static services = [ 'WordPress', 'Blogger', 'Medium', 'Squarespace', 'Wix' ] as const;
	private page: Page;

	/**
	 * Constructs an instance.
	 *
	 * @param {Page} page Underlying page on which interactions take place.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Select the target service from which site import should take place.
	 *
	 * @param {SourceService} service Allowed list of services.
	 */
	async selectService( service: SourceService ): Promise< void > {
		await Promise.all( [
			this.page.waitForLoadState( 'load' ),
			this.page.click( selectors.service( service ) ),
		] );
	}

	/**
	 * Verify the importer screen is shown.
	 *
	 * Note, there are two types of importers available in WPCOM:
	 * 	- URL based importer, where the target service's site URL is pasted.
	 * 	- File based importer, where the target service's file export is uploaded.
	 *
	 * @param {SourceService} service Allowed list of services.
	 */
	async verifyImporter( service: SourceService ): Promise< void > {
		//
		if ( [ 'WordPress', 'Wix' ].includes( service ) ) {
			await this.page.waitForSelector( selectors.siteInput );
			await this.page.waitForSelector( selectors.continueButton );
		} else {
			await this.page.waitForSelector( selectors.fileInputText );
			// Description text for the file uploader.
			await this.page.waitForSelector( `:has-text("from a ${ service } export file")` );
		}
	}

	/**
	 * Cancel the import process and return to the main Site Import screen.
	 */
	async cancel(): Promise< void > {
		if ( await this.page.isVisible( selectors.backButton ) ) {
			await this.page.click( selectors.backButton );
		} else {
			await this.page.click( selectors.cancelButton );
		}
	}
}
