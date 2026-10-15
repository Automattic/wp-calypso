import { Page } from 'playwright';

const selectors = {
	// Each goal is a `FlowCard`, rendered as a clickable `.flow-question` card containing its title.
	optionCard: ( title: string ) => `.flow-question:has-text("${ title }")`,
};

/**
 * Represents the "goals" step (Free / Paid / Import) of the Stepper newsletter flow.
 */
export class NewsletterGoalsPage {
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
	 * Selects the "Free newsletter" option, advancing to the domains step.
	 */
	async selectFreeNewsletter(): Promise< void > {
		await this.page.click( selectors.optionCard( 'Free newsletter' ) );
	}
}
