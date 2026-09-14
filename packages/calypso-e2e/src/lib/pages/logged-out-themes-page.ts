import { getCalypsoURL } from '../../data-helper';
import { waitForLocatorAttribute } from '../../element-helper';
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
		await this.viewFilter.waitFor( { state: 'visible', timeout: THEME_ACTION_TIMEOUT_MS } );
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

		await this.retryFilterSelection( filter, filterUrlPattern );
	}

	/**
	 * Starts signup with the first theme on the page.
	 *
	 * @returns {Promise<string>} The slug of the selected theme.
	 */
	async startWithFirstTheme(): Promise< string > {
		const getStartedRoute = await waitForLocatorAttribute(
			this.firstThemeGetStartedLink,
			'href',
			/theme=/,
			{
				timeout: THEME_ACTION_TIMEOUT_MS,
				description: 'First theme Get started link',
				state: 'visible',
			}
		);

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

	/**
	 * Retries the filter interaction because the logged-out theme grid can re-render during navigation.
	 */
	private async retryFilterSelection( filter: string, filterUrlPattern: RegExp ): Promise< void > {
		const intervals = [ 1_000, 2_000, 5_000 ];
		const deadline = Date.now() + THEME_NAVIGATION_TIMEOUT_MS;
		let attempt = 0;
		let lastError: unknown;

		while ( Date.now() < deadline ) {
			try {
				await this.waitUntilLoaded();
				await this.viewFilter.scrollIntoViewIfNeeded();
				await this.viewFilter.click();
				await this.page.getByRole( 'option', { name: filter, exact: true } ).click();
				await this.page.waitForURL( filterUrlPattern, {
					timeout: Math.max( deadline - Date.now(), 500 ),
					waitUntil: 'domcontentloaded',
				} );
				const filterText = await this.viewFilter.textContent( {
					timeout: THEME_ACTION_TIMEOUT_MS,
				} );
				if ( ! filterText?.includes( filter ) ) {
					throw new Error(
						`Expected theme filter to contain "${ filter }", got "${ filterText }"`
					);
				}
				await this.firstThemeCard.waitFor( {
					state: 'visible',
					timeout: THEME_ACTION_TIMEOUT_MS,
				} );
				return;
			} catch ( error ) {
				lastError = error;
				if ( Date.now() >= deadline ) {
					break;
				}
				const wait = Math.min(
					intervals[ Math.min( attempt, intervals.length - 1 ) ],
					deadline - Date.now()
				);
				attempt += 1;
				await this.page.waitForTimeout( wait );
			}
		}

		throw lastError;
	}
}
