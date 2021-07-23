import { Page } from 'playwright';
import { getViewportName } from '../../browser-helper';

export type Plan = 'Free' | 'Personal' | 'Premium' | 'Business' | 'eCommerce';
export type PlansPageTab = 'My Plan' | 'Plans';
export type PlanActionButton = 'Manage plan' | 'Upgrade';

const selectors = {
	myPlanTitle: '.my-plan-card__title',
	navigationTab: '.section-nav-tab',
	activeNavigationTab: '.is-selected.section-nav-tab',
	mobileActionButton: '.plan-features__mobile >> .plan-features__actions-button',
	desktopActionButtion: '.plan-features__table >> .plan-features__actions-button',
};

/**
 * Page representing the Plans page accessible at Upgrades >> Plans
 */
export class PlansPage {
	private page: Page;

	/**
	 * Constructs an instance of the Plans POM.
	 *
	 * @param {Page} page Instance of the Playwright page
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Validates that the provided plan name is the title of the active plan in the My Plan tab of the Plans page. Throws if it isn't.
	 *
	 * @param expectedPlan Name of the expected plan.
	 * @throws If the expected plan title is not found in the timeout period.
	 */
	async validatePlanInMyPlan( expectedPlan: Plan ): Promise< void > {
		await this.page.waitForSelector( `${ selectors.myPlanTitle }:has-text("${ expectedPlan }")` );
	}

	/**
	 * Validates that the provided tab name is the the currently active tab in the wrapper Plans page. Throws if it isn't.
	 *
	 * @param expectedTab Name of the expected tab.
	 * @throws If the expected tab name is not the active tab.
	 */
	async validateActiveNavigationTab( expectedTab: PlansPageTab ): Promise< void > {
		await this.page.waitForSelector(
			`${ selectors.activeNavigationTab }:has-text("${ expectedTab }")`
		);
	}

	/**
	 * Click on the provided tab name in the navigation tab at the top of the Plans activity
	 *
	 * @param targetTab Name of the navigation tab to click on
	 */
	async clickNavigationTab( targetTab: PlansPageTab ): Promise< void > {
		await this.page.click( `${ selectors.navigationTab }:has-text("${ targetTab }")` );
	}

	/**
	 * Click a plan action button (on the plan cards on the "Plans" tab) based on expected plan name and button text.
	 *
	 * @param param0 Object containing plan name and button text
	 * @param param0.plan Name of the plan (e.g. "Premium")
	 * @param param0.buttonText Expected action button text (e.g. "Upgrade")
	 */
	async clickPlanActionButton( {
		plan,
		buttonText,
	}: {
		plan: Plan;
		buttonText: PlanActionButton;
	} ): Promise< void > {
		const baseSelector =
			getViewportName() === 'mobile'
				? selectors.mobileActionButton
				: selectors.desktopActionButtion;

		const fullButtonSelector = `${ baseSelector }.is-${ plan.toLowerCase() }-plan:has-text("${ buttonText }")`;
		await Promise.all( [ this.page.waitForNavigation(), this.page.click( fullButtonSelector ) ] );
		await this.page.waitForLoadState( 'load' );
	}
}
