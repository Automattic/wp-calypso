import { Locator, Page } from 'playwright';
import envVariables from '../../env-variables';

/**
 * Represents the Jetpack > Traffic page.
 */
export class JetpackTrafficPage {
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
	 * Visit the page directly.
	 */
	async visit( siteUrl: string ): Promise< void > {
		await this.page.goto( `${ envVariables.CALYPSO_BASE_URL }/marketing/traffic/${ siteUrl }` );
	}

	/**
	 * Get the heading for the Traffic page.
	 * @returns The heading element for the Traffic page.
	 */
	get trafficHeading(): Locator {
		return this.page.getByRole( 'heading', { name: 'Traffic' } );
	}

	/**
	 * Get the SEO heading for the Traffic page.
	 * @returns The SEO heading element for the Traffic page.
	 */
	get seoHeading(): Locator {
		return this.page.getByRole( 'heading', { name: 'Search engine optimization' } );
	}

	/**
	 * Get the SEO Upsell Link for the Traffic page.
	 * @returns The SEO Upsell Link element for the Traffic page.
	 */
	get seoUpsellLink(): Locator {
		return this.page.getByRole( 'link', {
			name: 'Boost your search engine ranking with the powerful SEO tools',
		} );
	}
}
