/**
 * External dependencies
 */
import assert from 'assert';

/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { ElementHandle, Page } from 'playwright';

const selectors = {
	supportButton: '.inline-help__button',
	supportPopover: '.inline-help__popover',
	searchInput: '.form-text-input.search__input',
	spinner: '.spinner',
	clearSearch: '[aria-label="Close Search"]',

	resultsList: '.inline-help__results',
	results: '.inline-help__results-item',
	supportItems: '[aria-labelledby="inline-search--api_help"] li',
	adminItems: '[aria-labelledby="inline-search--admin_section"] li',
	emptyResults: '.inline-help__empty-results',
};

export class SupportComponent extends BaseContainer {
	constructor( page: Page ) {
		super( page, selectors.supportButton );
	}

	async clickSupportButton(): Promise< void > {
		const isPopoverOpen = await this.page.isVisible( selectors.supportPopover );

		if ( isPopoverOpen ) {
			await this.closePopover();
		} else {
			await this.openPopover();
		}
	}

	async openPopover(): Promise< void > {
		await this.page.click( selectors.supportButton );
		await this.page.waitForSelector( selectors.supportPopover, { state: 'visible' } );
	}

	async closePopover(): Promise< void > {
		await this.page.click( selectors.supportButton );
		await this.page.waitForSelector( selectors.supportPopover, { state: 'hidden' } );
	}

	async getResults( selector: string ): Promise< ElementHandle[] > {
		await this.page.waitForLoadState( 'domcontentloaded' );
		return await this.page.$$( selector );
	}

	/* Returns the overall number of results, not distinguishing the support and admin results.
	 */
	async getOverallResults(): Promise< ElementHandle[] > {
		return await this.getResults( selectors.results );
	}

	async getOverallResultsCount(): Promise< number > {
		const items = await this.getOverallResults();
		return items.length;
	}

	/* Returns the results for support entries. */

	async getSupportResults(): Promise< ElementHandle[] > {
		return await this.getResults( selectors.supportItems );
	}

	async getSupportResultsCount(): Promise< number > {
		const items = await this.getSupportResults();
		return items.length;
	}

	/* Returns the results for admin entries. */

	async getAdminResults(): Promise< ElementHandle[] > {
		return await this.getResults( selectors.adminItems );
	}

	async getAdminResultsCount(): Promise< number > {
		const items = await this.getAdminResults();
		return items.length;
	}

	async noResults(): Promise< void > {
		const adminResults = await this.getAdminResults();
		assert.deepStrictEqual( [], adminResults );
		const supportResults = await this.getSupportResults();
		assert.deepStrictEqual( [], supportResults );
		await this.page.waitForSelector( selectors.emptyResults );
	}

	async clickResult( target: number ): Promise< void > {
		const popOver = await this.page.waitForSelector( selectors.supportPopover );
		await popOver.waitForElementState( 'stable' );
		const items = await this.getOverallResultItems();

		const resultCount = await this.getOverallResultsCount();
		if ( resultCount < target ) {
			throw new Error(
				`Support popover shows ${ resultCount } entries, was asked to click on entry ${ target }`
			);
		}

		await items[ target ].click();
	}

	async search( text: string ): Promise< void > {
		await this.page.fill( selectors.searchInput, text );

		if ( ! text ) {
			await this.page.waitForSelector( selectors.spinner, { state: 'hidden' } );
		} else {
			await this.page.waitForSelector( selectors.spinner );
			await this.page.waitForSelector( selectors.spinner, { state: 'hidden' } );
		}
	}

	async clearSearch(): Promise< void > {
		await this.page.click( selectors.clearSearch );
	}
}
