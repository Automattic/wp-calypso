/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

const selectors = {
	main: '.main',
	addDomainButton: '.add-domain-button',
	targetPopover: '.popover__menu',
};

/**
 * Page representing the Upgrades > Domains page.
 *
 * @augments {BaseContainer}
 */
export class DomainsPage extends BaseContainer {
	constructor( page: Page ) {
		super( page, selectors.main );
	}

	async addDomain(
		options: { target?: 'this site' | 'new site' | 'different site' | 'without a site' } = {}
	): Promise< void > {
		await this.page.click( selectors.addDomainButton );
		await this.page.waitForSelector( selectors.targetPopover );
		const target = options.target;
		await this.page.click( `text=${ target }` );
	}
}
