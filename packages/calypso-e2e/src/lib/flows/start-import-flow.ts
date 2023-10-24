import { Page } from 'playwright';
import { DataHelper } from '../..';

const selectors = {
	// Generic
	button: ( text: string ) => `button:text("${ text }")`,
	backLink: '.navigation-link:text("Back")',
	dontHaveASiteButton: 'button:text-matches("don\'t have a site address", "i")',

	// Inputs
	urlInput: 'input.capture__input',
	goalsCaptureUrlInput: 'input.form-text-input[value]',

	// The "content only" "continue" button of '/start/from/importing/wordpress'
	wpContentOnlyContinueButton:
		'.content-chooser .import-layout__column:nth-child(2) > div > div:last-child button:text("Continue")',
	wpPreMigrationContentOnlyOptionButton: 'button:has-text("Use the content-only import option")',
	// ImporterDrag page
	importerDrag: ( text: string ) => `div.importer-wrapper__${ text }`,

	// Errors
	analyzeError: ( text: string ) => `:text("${ text }")`,

	// Headers
	setupHeader: 'h1:text("Themes")',
	startBuildingHeader: ( text: string ) => `h1.onboarding-title:text("${ text }")`,

	// Buttons
	checkUrlButton: 'form.capture__input-wrapper button.action-buttons__next',
	startBuildingButton: 'div.import__onboarding-page button.action-buttons__next',
	startImportButton: 'button:text("Import your site content")',
	startImportGoalButton: 'span:has-text("Import my existing website content")',
	// And entry of the list of selectable importers
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
	 * @param framework
	 */
	constructor(
		private page: Page,
		private framework: 'signup' | 'stepper'
	) {}

	/**
	 * Given text, click on the button's first instance with the text.
	 *
	 * @param {string} text User-visible text on the button.
	 */
	async clickButton( text: string ): Promise< void > {
		const selector = selectors.button( text );

		await this.page.waitForSelector( selector );
		await this.page.click( selector );
	}

	/**
	 * Validates that we've landed on the setup page.
	 */
	async validateSetupPage(): Promise< void > {
		await this.page.locator(
			`${ selectors.startImportButton }, ${ selectors.startImportGoalButton }`
		);
	}

	/**
	 * Validates that we've landed on the URL capture page.
	 */
	async validateURLCapturePage(): Promise< void > {
		await this.page.waitForURL( /.*setup\/site-setup\/import.*/ );
	}

	/**
	 * Validates that we've landed on the URL capture page with 'typo' error.
	 */
	async validateErrorCapturePage( error: string ): Promise< void > {
		await this.page.waitForSelector( selectors.analyzeError( error ) );
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
	 * Validates that we've landed on the import (migration) ready page.
	 */
	async validateUpgradePlanPage(): Promise< void > {
		await this.page.waitForSelector( selectors.startBuildingHeader( 'Upgrade your plan' ) );
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
	 * Validates that we've landed on the WordPress migration page.
	 */
	async validateWordPressPage(): Promise< void > {
		await this.page.waitForSelector( selectors.wpContentOnlyContinueButton );
	}

	/**
	 * Validates that we've landed on the importer drag page.
	 */
	async validateImporterDragPage( importer: string ): Promise< void > {
		await this.page.waitForSelector( selectors.importerDrag( importer ) );
	}

	/**
	 * Continue 'content only' WordPress migration.
	 */
	async contentOnlyWordPressPage(): Promise< void > {
		await this.page.click( selectors.wpContentOnlyContinueButton );
	}

	/**
	 * Continue 'content only' WordPress migration on pre-migration page.
	 */
	async clickPremigrationOptionButton(): Promise< void > {
		await this.page.locator( selectors.wpPreMigrationContentOnlyOptionButton ).click();
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
	 * @throws {Error} If no URL input is found.
	 */
	async enterURL( url: string ): Promise< void > {
		await this.page.waitForLoadState( 'load' );

		const legacyURLInputLocator = this.page.locator( selectors.urlInput );
		const goalsCaptureURLInputLocator = this.page.locator( selectors.goalsCaptureUrlInput );

		// Support both Legacy and Goals Capture versions
		// of the URL input for importer.
		// See https://github.com/Automattic/wp-calypso/issues/65792
		const element = await Promise.race( [
			legacyURLInputLocator.elementHandle(),
			goalsCaptureURLInputLocator.elementHandle(),
		] );

		if ( ! element ) {
			throw new Error( `No matching URL input found at Site Importer.` );
		}
		await element.fill( url );
		const continueLocator = this.page.locator(
			`${ selectors.checkUrlButton }, ${ selectors.button( 'Continue' ) }`
		);

		await continueLocator.click();
	}

	/**
	 * Go to first import page.
	 *
	 * @param {string} siteSlug The site slug URL.
	 */
	async startImport( siteSlug: string ): Promise< void > {
		const route = this.framework === 'signup' ? '/start/importer' : '/setup/setup-site';

		await this.page.goto( DataHelper.getCalypsoURL( route, { siteSlug } ) );
	}

	/**
	 * Go to first setup page.
	 *
	 * @param {string} siteSlug The site slug URL.
	 */
	async startSetup( siteSlug: string ): Promise< void > {
		const route =
			this.framework === 'signup' ? '/start/setup-site/intent' : '/setup/site-setup/intent';

		await this.page.goto( DataHelper.getCalypsoURL( route, { siteSlug } ) );
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
