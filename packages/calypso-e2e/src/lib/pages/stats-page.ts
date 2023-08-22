import { Locator, Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';
import { clickNavTab } from '../../element-helper';

export type StatsTabs = 'Traffic' | 'Insights' | 'Subscribers';
type StatsTrafficActivityCategory = 'Views' | 'Visitors' | 'Likes' | 'Comments';
type HighlightStatsPeriod = '7-day' | '30-day';
type StatsPeriod = 'Days' | 'Weeks' | 'Months' | 'Years';

const selectors = {
	highlightPeriodSelectButton: '.highlight-cards-heading__settings-action',
};

/**
 * Represents the Statistics page.
 */
export class StatsPage {
	private page: Page;
	private anchor: Locator;

	/**
	 * Constructs an instance of the page.
	 *
	 * @param {Page} page Underlying page on which interactions take place.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.anchor = this.page.getByRole( 'main' );
	}

	/**
	 *
	 * @param siteSlug
	 */
	async visit( siteSlug?: string ) {
		await this.page.goto( getCalypsoURL( `/stats/${ siteSlug }` ) );
	}

	/**
	 *
	 */
	private async dismissModal() {
		// Sometimes a modal appears when accessing Stats > Traffic.
		const dismissModalButton = this.page.getByRole( 'button', { name: 'Got it' } );

		if ( ( await dismissModalButton.count() ) > 0 ) {
			await dismissModalButton.click();
			await dismissModalButton.waitFor( { state: 'hidden' } );
		}
	}

	/**
	 * Given a string, click on the tab name on the page.
	 *
	 * @param {StatsTabs} name Name of the tab to click.
	 * @returns {Promise<void>} No return value.
	 */
	async clickTab( name: StatsTabs ): Promise< void > {
		await this.dismissModal();
		await clickNavTab( this.page, name );

		// Wait for the expected URL scheme to load.
		if ( name === 'Traffic' ) {
			await this.page.waitForURL( /stats\/day/ );
		}
		if ( name === 'Insights' ) {
			await this.page.waitForURL( /stats\/insights/ );
		}
		if ( name === 'Subscribers' ) {
			await this.page.waitForURL( /stats\/subscribers/ );
		}
	}

	// Traffic

	/**
	 *
	 * @param period
	 */
	async selectHighlightPeriod( period: HighlightStatsPeriod ): Promise< void > {
		await this.dismissModal();

		const switcherButton = this.anchor.locator( selectors.highlightPeriodSelectButton );
		await switcherButton.click();

		// Tooltips live outside the normal DOM tree.
		const tooltip = this.page.getByRole( 'tooltip', { name: /highlights/ } );
		await tooltip.waitFor();
		await tooltip.getByRole( 'button', { name: period } ).click();

		// Dismiss.
		await switcherButton.click();
	}

	/**
	 *
	 * @param period
	 */
	async selectStatsPeriod( period: StatsPeriod ) {
		const target = this.anchor.getByRole( 'radiogroup' ).getByRole( 'radio', { name: period } );
		await target.click();

		if ( ! ( await target.isChecked() ) ) {
			throw new Error( `Failed to select the Stats Period ${ period }` );
		}
	}

	/**
	 *
	 * @param category
	 */
	async showTrafficOfType( category: StatsTrafficActivityCategory ): Promise< void > {
		await this.page.locator( '.chart__bars' ).waitFor();

		const target = this.anchor
			.locator( '.stats-tabs' )
			.getByRole( 'listitem' )
			.filter( { hasText: category } );
		await target.waitFor();
		await target.click();

		await this.page.waitForURL( new RegExp( `tab=${ category }`, 'i' ) );

		const classes = await target.getAttribute( 'class' );
		if ( ! classes?.includes( 'is-selected' ) ) {
			throw new Error( `Failed to click and filter traffic data category to ${ category }.` );
		}
	}

	// Insights

	/**
	 *
	 */
	async clickViewAllAnnualInsights() {
		await this.anchor.getByRole( 'link', { name: 'View all annual insights' } ).click();

		await this.page.waitForURL( /annualstats/ );
	}

	/**
	 *
	 * @param year
	 */
	async annualInsightPresentForYear( year: number ) {
		await this.page
			.getByRole( 'main' )
			.getByRole( 'table' )
			.getByRole( 'rowheader' )
			.filter( { hasText: year.toString() } )
			.waitFor();
	}

	// Subscribers

	/**
	 *
	 * @param type
	 */
	async selectSubscriberType( type: 'WordPress.com' | 'Email' ) {
		const target = this.anchor.getByRole( 'radiogroup' ).getByRole( 'radio', { name: type } );
		await target.click();

		if ( ! ( await target.isChecked() ) ) {
			throw new Error( `Failed to select the Subscriber type ${ type }` );
		}
	}
}
