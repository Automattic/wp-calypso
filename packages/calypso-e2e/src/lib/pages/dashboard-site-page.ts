import { Locator, Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

const selectors = {
	guidedTourContainer: '.guided-tour__popover',
	guidedTourGotItButton: ( locator: Locator ) => locator.getByRole( 'button', { name: 'Got it' } ),
};

/**
 * Represents the Sites > Site page.
 */
export class DashboardSitePage {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Visits the `/sites/$siteSlug` endpoint.
	 *
	 * @param {string} siteSlug Site URL.
	 */
	async visit( siteSlug: string ): Promise< void > {
		await this.page.goto( getCalypsoURL( `sites/${ siteSlug }` ), {
			timeout: 20 * 1000,
		} );
	}

	/**
	 * Closes the guided tour if it is visible.
	 */
	async maybeCloseGuidedTour(): Promise< void > {
		const guidedTourContainer = this.page.locator( selectors.guidedTourContainer );

		try {
			await guidedTourContainer.waitFor( {
				timeout: 5 * 1000,
			} );
		} catch ( error ) {
			// The guided tour is not visible.
			return;
		}

		await selectors.guidedTourGotItButton( guidedTourContainer ).click();
	}
}
