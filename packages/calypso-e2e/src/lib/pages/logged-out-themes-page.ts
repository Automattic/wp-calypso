import { expect } from 'playwright/test';
import { getCalypsoURL } from '../../data-helper';
import type { Locator, Page } from 'playwright';

const THEME_ACTION_TIMEOUT_MS = 10 * 1000;
const THEME_NAVIGATION_TIMEOUT_MS = 30 * 1000;

/**
 * Resolves a logged-out theme "Get started" href against the current test target.
 *
 * @param {string} getStartedRoute The route or URL from the theme CTA.
 * @param {string} currentUrl The current page URL used to resolve relative hrefs.
 * @returns {Object} The Calypso URL and selected theme slug.
 */
export function getCalypsoGetStartedUrlFromHref(
	getStartedRoute: string,
	currentUrl: string
): { themeSlug: string; url: string } {
	const getStartedRouteUrl = new URL( getStartedRoute, currentUrl );
	const url = getCalypsoURL(
		`${ getStartedRouteUrl.pathname }${ getStartedRouteUrl.search }${ getStartedRouteUrl.hash }`
	);
	const themeSlug = new URL( url ).searchParams.get( 'theme' );
	if ( ! themeSlug ) {
		throw new Error( 'Theme slug not found' );
	}

	return { themeSlug, url };
}

/**
 * Represents the logged-out themes showcase page.
 */
export class LoggedOutThemesPage {
	private page: Page;
	readonly firstThemeCard: Locator;
	private readonly firstThemeGetStartedLink: Locator;
	private readonly viewFilter: Locator;

	/**
	 * Constructs an instance of the logged-out themes showcase page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.firstThemeCard = this.page.locator( '[data-e2e-theme]' ).first();
		this.firstThemeGetStartedLink = this.firstThemeCard
			.getByRole( 'link', { name: 'Get started' } )
			.first();
		this.viewFilter = this.page.getByRole( 'combobox', { name: 'View' } ).first();
	}

	/**
	 * Waits for the logged-out themes showcase page to be ready for interaction.
	 */
	async waitUntilLoaded(): Promise< void > {
		await this.page.waitForURL( /\/themes(?:\/[^/?#]+)?(?:[?#].*)?$/, {
			timeout: THEME_NAVIGATION_TIMEOUT_MS,
			waitUntil: 'domcontentloaded',
		} );
		await expect( this.viewFilter ).toBeVisible( { timeout: THEME_ACTION_TIMEOUT_MS } );
	}

	/**
	 * Filters the themes by the given filter.
	 *
	 * @param {string} filter - The filter to apply.
	 */
	async filterBy( filter: string ): Promise< void > {
		const filterSlug = filter.toLowerCase();
		const filterUrlPattern =
			filterSlug === 'all'
				? /\/themes(?:[?#].*)?$/
				: new RegExp( `/themes/${ filterSlug }(?:[?#].*)?$` );

		await expect( async () => {
			await this.waitUntilLoaded();
			await this.viewFilter.scrollIntoViewIfNeeded();
			await this.viewFilter.click();
			await this.page.getByRole( 'option', { name: filter, exact: true } ).click();
			await this.page.waitForURL( filterUrlPattern, {
				waitUntil: 'domcontentloaded',
			} );
			await expect( this.viewFilter ).toContainText( filter );
			await expect( this.firstThemeCard ).toBeVisible();
		} ).toPass( {
			timeout: THEME_NAVIGATION_TIMEOUT_MS,
			intervals: [ 1_000, 2_000, 5_000 ],
		} );
	}

	/**
	 * Starts signup with the first theme on the page.
	 *
	 * @returns {Promise<string>} The slug of the selected theme.
	 */
	async startWithFirstTheme(): Promise< string > {
		await expect( this.firstThemeGetStartedLink ).toBeVisible( {
			timeout: THEME_ACTION_TIMEOUT_MS,
		} );
		await expect( this.firstThemeGetStartedLink ).toHaveAttribute( 'href', /theme=/, {
			timeout: THEME_ACTION_TIMEOUT_MS,
		} );

		const getStartedRoute = await this.firstThemeGetStartedLink.getAttribute( 'href' );
		if ( ! getStartedRoute ) {
			throw new Error( 'First theme Get started URL not found' );
		}

		const { themeSlug, url: getStartedUrl } = getCalypsoGetStartedUrlFromHref(
			getStartedRoute,
			this.page.url()
		);

		await this.page.goto( getStartedUrl, {
			timeout: THEME_NAVIGATION_TIMEOUT_MS,
			waitUntil: 'domcontentloaded',
		} );

		return themeSlug;
	}
}
