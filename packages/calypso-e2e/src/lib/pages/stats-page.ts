import { Locator, Page } from 'playwright';
import { envVariables } from '../..';
import { getCalypsoURL } from '../../data-helper';
import { clickNavTab } from '../utils';

export type StatsTabs = 'Traffic' | 'Insights' | 'Subscribers' | 'Store';
type TrafficActivityType = 'Views' | 'Visitors' | 'Likes' | 'Comments';
type StoreActivityType = 'Gross Sales' | 'Net sales' | 'Orders' | 'Avg. Order Value';
// Discriminated Union type.
type ActivityTypes =
	| { tab: 'Traffic'; type: TrafficActivityType }
	| { tab: 'Store'; type: StoreActivityType };
type StatsPeriod = 'Days' | 'Weeks' | 'Months' | 'Years';
type SubscriberOrigin = 'WordPress.com' | 'Email';

const selectors = {
	graph: '.chart__bars',
	statsTabs: '.stats-tabs',
};

/**
 * Represents the Stats page, powered by Jetpack.
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

	// General

	/**
	 * Visits the site.
	 *
	 * If optional parameter `siteSlug` is defined the stats page
	 * for the speicfic site will be loaded.
	 *
	 * @param {string} [siteSlug] Site slug of the test site.
	 */
	async visit( siteSlug?: string ) {
		await this.page.goto( getCalypsoURL( `/stats/${ siteSlug }` ) );
	}

	/**
	 * Dismisses the tooltip which appears in the Traffic tab.
	 */
	private async dismissTooltip() {
		// Sometimes a modal appears when accessing Stats > Traffic.
		const tooltipButton = this.page.getByRole( 'button', { name: 'Got it' } );

		if ( ( await tooltipButton.count() ) > 0 ) {
			await tooltipButton.click();
			await tooltipButton.waitFor( { state: 'hidden' } );
		}
	}

	/**
	 * Given a string, click on the tab name on the page.
	 *
	 * @param {StatsTabs} name Name of the tab to click.
	 * @returns {Promise<void>} No return value.
	 */
	async clickTab( name: StatsTabs ): Promise< void > {
		await this.dismissTooltip();
		await clickNavTab( this.page, name );

		// Wait for the expected URL scheme to load.
		// Note, the Store tab is only available for Business and above plans.
		if ( name === 'Traffic' ) {
			await this.page.waitForURL( /stats\/day/ );
		}
		if ( name === 'Insights' ) {
			await this.page.waitForURL( /stats\/insights/ );
		}
		if ( name === 'Subscribers' ) {
			await this.page.waitForURL( /stats\/subscribers/ );
		}
		if ( name === 'Store' ) {
			await this.page.waitForURL( /store\/stats\/orders/ );
		}
	}

	/**
	 * Selects the period to show for the stats, including the graph.
	 *
	 * @param {StatsPeriod} period Stats period to show.
	 */
	async selectStatsPeriod( period: StatsPeriod ) {
		const target = this.anchor.getByRole( 'radiogroup' ).getByRole( 'radio', { name: period } );
		await target.click();

		if ( ! ( await target.isChecked() ) ) {
			throw new Error( `Failed to select the Stats Period ${ period }` );
		}
	}

	/**
	 * For new Interval Dropdown
	 * Selects the period to show for the stats, including the graph.
	 *
	 * @param {StatsPeriod} period Stats period to show.
	 */
	async selectStatsPeriodFromDropdown( period: StatsPeriod ) {
		const expandDropdownButton = this.anchor
			.locator( '.stats-interval-dropdown' )
			.getByRole( 'button' )
			.first();
		await expandDropdownButton.click();

		const target = this.page
			.locator( '.components-popover' )
			.getByRole( 'radio', { name: period } );
		await target.click();

		if ( ! ( await target.isChecked() ) ) {
			throw new Error( `Failed to select the Stats Period ${ period }` );
		}
	}

	/**
	 * Changes the stats view to specific activities.
	 *
	 * @param {ActivityTypes} activityType Type of activity to show.
	 */
	async showStatsOfType( activityType: ActivityTypes ): Promise< void > {
		// Wait for the charts to load first, even if no activity is present.
		// CSS selector has to be used here because there is no a11y selector
		// for this element.
		// A loop is used here because multiple locators can match the CSS locator
		// and to be safe, it's best to wait for all placeholders to be detached.
		const locators = await this.page.locator( '.is-loading' ).all();
		for ( const locator of locators ) {
			await locator.waitFor( { state: 'detached' } );
		}

		// CSS selector is used to narrow down to the Stats Activity tab for
		// similar reason to above.
		const target = this.anchor
			.locator( selectors.statsTabs )
			.getByRole( 'listitem' )
			.filter( { hasText: activityType.type } );
		await target.waitFor();
		await target.click();

		// The chart legend will update, but this only happens on Desktop viewports.
		if ( envVariables.VIEWPORT_NAME === 'desktop' ) {
			await this.anchor
				.locator( '.chart__legend-options' )
				.getByRole( 'listitem' )
				.filter( { hasText: activityType.type } )
				.waitFor();
		}

		// Verify the selected stats type is now active.
		// A slightly different selector has to be used because the active tab
		// is not reported using accessible selectors but a CSS class.
		await this.anchor
			.locator( selectors.statsTabs )
			.locator( '.is-selected' )
			.filter( { hasText: activityType.type } )
			.waitFor();
	}

	// Insights

	/**
	 * Clicks on the link to see annual insights.
	 *
	 * This link is only available in site specific view.
	 */
	async clickViewAllAnnualInsights() {
		await this.anchor.getByRole( 'link', { name: 'View all annual insights' } ).click();

		await this.page.waitForURL( /annualstats/ );
	}

	/**
	 * Verifies that annual insight for a specific year is present.
	 *
	 * @param {number} year Expected year to be present.
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
	 * Selects the subscriber type to show in the Subscribers tab.
	 *
	 * @param {SubscriberOrigin} type Subscriber type.
	 */
	async selectSubscriberType( type: SubscriberOrigin ) {
		const target = this.anchor.getByRole( 'radiogroup' ).getByRole( 'radio', { name: type } );
		await target.click();

		if ( ! ( await target.isChecked() ) ) {
			throw new Error( `Failed to select the Subscriber type ${ type }` );
		}
	}

	// Store
}
