import { Locator, Page } from 'playwright';

/**
 * Represents the logged-out themes showcase page.
 */
export class LoggedOutThemesPage {
	private page: Page;
	readonly firstThemeCard: Locator;

	/**
	 * Constructs an instance of the logged-out themes showcase page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.firstThemeCard = this.page.locator( '[data-e2e-theme]' ).first();
	}

	/**
	 * Clicks the "Get started" overlay button on the first theme card matching the
	 * optional tier filter, navigating straight to the signup flow and skipping the
	 * theme details page. Returns the theme slug parsed from the link's href.
	 *
	 * @param {Object} [options]
	 * @param {string} [options.tier] - Theme tier slug (e.g. 'premium', 'free') to filter by.
	 */
	async selectThemeForSignup( { tier }: { tier?: string } = {} ): Promise< string > {
		const card = (
			tier
				? this.page.locator( `[data-e2e-theme]:has(.theme-tier-badge--${ tier })` )
				: this.page.locator( '[data-e2e-theme]' )
		).first();
		await card.waitFor( { state: 'visible', timeout: 30_000 } );

		const getStartedLink = card.getByRole( 'link', { name: 'Get started' } );
		const href = await getStartedLink.getAttribute( 'href' );
		if ( ! href ) {
			throw new Error( '"Get started" link is missing an href on the theme card' );
		}
		const themeSlug = new URL( href, this.page.url() ).searchParams.get( 'theme' );
		if ( ! themeSlug ) {
			throw new Error( `Theme slug not found in "Get started" href: ${ href }` );
		}

		await getStartedLink.click();
		return themeSlug;
	}

	/**
	 * Filters the themes by the given filter.
	 *
	 * Selecting a tier triggers a client-side navigation that re-renders the showcase.
	 * Wait for cards to settle after that transition so callers can click them safely.
	 *
	 * @param {string} filter - The filter to apply.
	 */
	async filterBy( filter: string ) {
		await this.page.getByRole( 'combobox', { name: 'View' } ).click();
		await this.page.getByRole( 'option', { name: filter } ).click();
		await this.firstThemeCard.waitFor( { state: 'visible', timeout: 30_000 } );
	}
}
