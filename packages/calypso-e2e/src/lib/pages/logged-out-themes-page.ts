import { expect } from 'playwright/test';
import { getCalypsoURL } from '../../data-helper';
import type { Locator, Page } from 'playwright';

const THEME_ACTION_TIMEOUT_MS = 10 * 1000;
const THEME_NAVIGATION_TIMEOUT_MS = 30 * 1000;

/**
 * Caps a helper's total runtime, even when it contains multiple Playwright waits.
 *
 * @param {Promise} promise The helper work to run.
 * @param {number} timeout Maximum time to wait.
 * @param {string} errorMessage Message to throw when the timeout is reached.
 * @returns {Promise} The wrapped promise result.
 */
async function withTimeout< T >(
	promise: Promise< T >,
	timeout: number,
	errorMessage: string
): Promise< T > {
	let timeoutId: ReturnType< typeof setTimeout > | undefined;
	const timeoutPromise = new Promise< never >( ( _, reject ) => {
		timeoutId = setTimeout( () => reject( new Error( errorMessage ) ), timeout );
	} );

	try {
		return await Promise.race( [ promise, timeoutPromise ] );
	} finally {
		if ( timeoutId ) {
			clearTimeout( timeoutId );
		}
	}
}

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
		await withTimeout(
			this.filterByWithinTimeout( filter ),
			THEME_NAVIGATION_TIMEOUT_MS,
			`Timed out filtering logged-out themes by "${ filter }"`
		);
	}

	/**
	 * Applies a theme filter within the caller's total timeout budget.
	 *
	 * @param {string} filter - The filter to apply.
	 */
	private async filterByWithinTimeout( filter: string ): Promise< void > {
		await this.waitUntilLoaded();
		await this.viewFilter.scrollIntoViewIfNeeded();
		await this.viewFilter.click();
		const filterSlug = filter.toLowerCase();
		const filterUrlPattern =
			filterSlug === 'all'
				? /\/themes(?:[?#].*)?$/
				: new RegExp( `/themes/${ filterSlug }(?:[?#].*)?$` );

		await this.page.getByRole( 'option', { name: filter, exact: true } ).click();
		await this.page.waitForURL( filterUrlPattern, {
			timeout: THEME_NAVIGATION_TIMEOUT_MS,
			waitUntil: 'domcontentloaded',
		} );
		await expect( this.viewFilter ).toContainText( filter, {
			timeout: THEME_ACTION_TIMEOUT_MS,
		} );
		await expect( this.firstThemeCard ).toBeVisible( { timeout: THEME_ACTION_TIMEOUT_MS } );
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
