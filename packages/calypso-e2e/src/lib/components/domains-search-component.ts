/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

const selectors = {
	main: '.domain-search__content',
	busy: '.is-busy',
	searchBox: '.register-domain-step__search-card input',
	suggestionList: '.domain-search-results__domain-suggestions',
	suggestionPlaceholder: '.is-placeholder',
	moreResultsButton: '.register-domain-step__next-page-button',

	// G Suite upsell
	gSuiteCard: '.gsuite-upsell-card__form',
	gSuiteSkipButton: '.gsuite-upsell-card__skip-button',
};

/**
 * Component for domain search and selection.
 *
 * @augments {BaseContainer}
 */
export class DomainsSearchComponent extends BaseContainer {
	constructor( page: Page ) {
		super( page, selectors.main );
	}

	async _postInit(): Promise< void > {
		await this.page.waitForSelector( selectors.moreResultsButton );
	}

	async search( name: string ): Promise< void > {
		await this.page.fill( selectors.searchBox, name );
		await this.page.waitForSelector( selectors.suggestionPlaceholder, { state: 'detached' } );
		const element = await this.page.waitForSelector( selectors.moreResultsButton );
		await element.waitForElementState( 'stable' );
	}

	async selectByName( name: string ): Promise< void > {
		await this.page.click( `text=${ name }` );
	}

	async selectByTld( tld: string ): Promise< void > {
		if ( tld.charAt( 0 ) !== '.' ) {
			tld = '.' + tld;
		}

		const element = await this.page.waitForSelector(
			`${ selectors.suggestionList }:has-text("${ tld }")`
		);
		console.log( await element.innerHTML() );
		await element.waitForElementState( 'stable' );
		await element.click();
		await this.page.waitForSelector( selectors.busy, { state: 'hidden' } );
	}

	async declineGSuite(): Promise< void > {
		await this.page.waitForSelector( selectors.gSuiteCard );
		await this.page.click( selectors.gSuiteSkipButton );
	}
}
