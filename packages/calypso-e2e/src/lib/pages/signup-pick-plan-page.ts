import { Page } from 'playwright';
import type { Plans } from '../../types';

const selectors = {
	freePlan: 'button:text("start with a free site")',
	paidPlan: ( target: Plans ) => `button.is-${ target.toLowerCase() }-plan`,
};

/**
 * Class representing Signup > Pick a Plan page.
 */
export class SignupPickPlanPage {
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
	 * Selects a WordPress.com plan matching the name, triggering site creation.
	 *
	 * @param {Plans} name Name of the plan.
	 */
	async selectPlan( name: Plans ): Promise< void > {
		if ( name === 'Free' ) {
			await Promise.all( [
				this.page.waitForNavigation( { timeout: 60000, waitUntil: 'load' } ),
				this.page.click( selectors.freePlan ),
			] );
		} else {
			await Promise.all( [
				// Extend timeout in case the site creation step takes longer than expected.
				this.page.waitForNavigation( { timeout: 60000, waitUntil: 'load' } ),
				this.page.click( selectors.paidPlan( name ) ),
			] );
		}
	}
}
