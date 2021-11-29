import { Page } from 'playwright';
import { DataHelper } from '../..';

const selectors = {
	// Generic
	button: ( text: string ) => `button:text("${ text }")`,
	backLink: 'a:text("Back")',
	dontHaveASiteButton: 'a:text("I don\'t have a site address")',

	// Inputs
	urlInput: 'input.capture__input',

	// Errors
	analyzeError: ( text: string ) => `div.capture__input-error-msg:text("${ text }")`,

	// Headers
	scanningHeader: 'h1:text("Scanning your site")',
	setupHeader: 'h1:text("Themes")',
	startBuildingHeader: ( text: string ) => `h1.onboarding-title:text("${ text }")`,

	// Buttons
	checkUrlButton: 'form.capture__input-wrapper button.action-buttons__next',
	startBuildingButton: 'div.import__onboarding-page button.action-buttons__next',
	startImportButton:
		'div.is-intent button.select-items-alt__item-button:text("Import your site content")',
	importerListButton: ( index: number ) =>
		`div.list__importers-primary:nth-child(${ index + 1 }) .action-card__button-container button`,
};

/**
 * Class encapsulating the flow when starting a new start importer ('/start/importer')
 */
export class StartImportFlow {
	/**
	 * Constructs an instance of the flow.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( private page: Page ) {}

	/**
	 * Given text, clicks on the first instance of the button with the text.
	 *
	 * @param {string} text User-visible text on the button.
	 */
	async clickButton( text: string ): Promise< void > {
		await this.page.click( selectors.button( text ) );
	}

	/**
	 * Validates that we've landed on the setup page.
	 */
	async validateSetupPage(): Promise< void > {
		await this.page.waitForSelector( selectors.startImportButton );
	}

	/**
	 * Validates that we've landed on the URL capture page.
	 */
	async validateURLCapturePage(): Promise< void > {
		await this.page.waitForSelector( selectors.urlInput );
	}

	/**
	 * Validates that we've landed on the URL capture page with 'typo' error.
	 */
	async validateErrorCapturePage( error: string ): Promise< void > {
		await this.page.waitForSelector( selectors.analyzeError( error ) );
	}

	/**
	 * Validates that we've landed on the scanning page.
	 */
	async validateScanningPage(): Promise< void > {
		await this.page.waitForSelector( selectors.scanningHeader );
	}

	/**
	 * Validates that we've landed on the import page.
	 */
	async validateImportPage(): Promise< void > {
		await this.page.waitForSelector(
			selectors.startBuildingHeader( 'Your content is ready for its brand new home' )
		);
	}

	/**
	 * Validates that we've landed on the building page.
	 *
	 * @param {string} reason The reason shown in main header.
	 */
	async validateBuildingPage( reason: string ): Promise< void > {
		await this.page.waitForSelector( selectors.startBuildingHeader( reason ) );
	}

	/**
	 * Validates that we've landed on the design setup page.
	 */
	async validateDesignPage(): Promise< void > {
		await this.page.waitForSelector( selectors.setupHeader );
	}

	/**
	 * Validates that we've landed on the importer list page.
	 */
	async validateImporterListPage(): Promise< void > {
		await this.page.waitForSelector(
			selectors.startBuildingHeader( 'Import your content from another platform' )
		);
	}

	/**
	 * Enter the URL to import from on the "Enter your site address" input form.
	 *
	 * @param {string} url The source URL.
	 */
	async enterURL( url: string ): Promise< void > {
		await this.page.fill( selectors.urlInput, url );
		await this.page.click( selectors.checkUrlButton );
	}

	/**
	 * Go to first import page.
	 *
	 * @param {string} siteSlug The site slug URL.
	 */
	async startImport( siteSlug: string ): Promise< void > {
		await this.page.goto( DataHelper.getCalypsoURL( '/start/importer', { siteSlug } ) );
	}

	/**
	 * Go to first setup page.
	 *
	 * @param {string} siteSlug The site slug URL.
	 */
	async startSetup( siteSlug: string ): Promise< void > {
		await this.page.goto( DataHelper.getCalypsoURL( '/start/setup-site/intent', { siteSlug } ) );
		await this.validateSetupPage();
		await this.page.click( selectors.startImportButton );
	}

	/**
	 * Start the building.
	 */
	async startBuilding(): Promise< void > {
		await this.page.click( selectors.startBuildingButton );
	}

	/**
	 * Open the importer list page.
	 */
	async startImporterList(): Promise< void > {
		await this.page.click( selectors.dontHaveASiteButton );
	}

	/**
	 * An entry from the list of importers.
	 *
	 * @param index the desired importer
	 */
	async selectImporterFromList( index: number ): Promise< void > {
		await this.page.click( selectors.importerListButton( index ) );
		await this.page.waitForSelector(
			selectors.startBuildingHeader( 'Your content is ready for its new home' )
		);
	}

	/**
	 * Navigate back one screen in the flow.
	 */
	async goBackOneScreen(): Promise< void > {
		await Promise.all( [ this.page.waitForNavigation(), this.page.click( selectors.backLink ) ] );
	}
}
