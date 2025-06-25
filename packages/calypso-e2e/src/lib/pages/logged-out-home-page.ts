import { Page } from 'playwright';
import { DataHelper } from '../..';

/**
 * Represents the WPCOM LOHP.
 */
export class LoggedOutHomePage {
	private page: Page;

	/**
	 * Constructs an instance of the LOHP.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Selects the first visible theme on the LOHP.
	 */
	async selectFirstTheme() {
		// Hovering over the container to stop the carousel scrolling
		// The force is necessary as the container is not considered stable due to the scrolling
		const themeContainer = this.page.locator( '.lp-content.lp-content-area--scrolling' ).first();
		await themeContainer.hover( { force: true } );

		// Hovering over the theme card is necessary to make the "Start with this theme" button visible.
		const themeCard = themeContainer.locator( '.lp-image-top-row' ).last();
		await themeCard.hover();

		const themeButton = themeCard.getByText( 'Start with this theme' );
		const calypsoUrl = new URL( DataHelper.getCalypsoURL() );
		const themeButtonUrl = new URL( ( await themeButton.getAttribute( 'href' ) ) || '' );

		if ( calypsoUrl.hostname !== 'wordpress.com' ) {
			// Reroute the click to the current Calypso URL.
			await this.page.route( themeButtonUrl.href, async ( route ) => {
				themeButtonUrl.host = calypsoUrl.host;
				themeButtonUrl.protocol = calypsoUrl.protocol;

				await route.abort();
				await this.page.unrouteAll( { behavior: 'ignoreErrors' } );
				await this.page.goto( themeButtonUrl.href, { waitUntil: 'load' } );
			} );
		}
		// Get theme slug
		const pageMatch = new URL( themeButtonUrl.href ).search.match( 'theme=([a-z]*)?&' );
		const themeSlug = pageMatch?.[ 1 ] || null;

		// Hover, otherwise the element isn't considered stable, and is out of the viewport.
		await themeCard.hover( { force: true } );
		await themeCard.getByText( 'Start with this theme' ).click( { force: true } );

		return themeSlug;
	}

	/**
	 * Clicks the "Explore themes" button.
	 */
	async clickExploreThemes() {
		return Promise.all( [
			this.page.waitForNavigation( { waitUntil: 'load' } ),
			this.page.getByRole( 'link', { name: 'Explore themes' } ).click(),
		] );
	}
}
