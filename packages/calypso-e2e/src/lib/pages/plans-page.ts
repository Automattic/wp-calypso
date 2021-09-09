import { Page } from 'playwright';
import { getTargetDeviceName } from '../../browser-helper';
import { TargetDevice } from '../../types';

// Types to restrict the string arguments passed in. These are fixed sets of strings, so we can be more restrictive.
export type Plan = 'Free' | 'Personal' | 'Premium' | 'Business' | 'eCommerce';
export type PlansPageTab = 'My Plan' | 'Plans';
export type PlanActionButton = 'Manage plan' | 'Upgrade';

const selectors = {
	myPlanTitle: ( planName: Plan ) => `.my-plan-card__title:has-text("${ planName }")`,
	navigationTab: ( tabName: PlansPageTab ) => `.section-nav-tab:has-text("${ tabName }")`,
	activeNavigationTab: ( tabName: PlansPageTab ) =>
		`.is-selected.section-nav-tab:has-text("${ tabName }")`,
	actionButton: ( {
		viewport,
		plan,
		buttonText,
	}: {
		viewport: TargetDevice;
		plan: Plan;
		buttonText: PlanActionButton;
	} ) => {
		const viewportSuffix = viewport === 'mobile' ? 'mobile' : 'table';
		return `.plan-features__${ viewportSuffix } >> .plan-features__actions-button.is-${ plan.toLowerCase() }-plan:has-text("${ buttonText }")`;
	},
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
	 * @param {Plan} expectedPlan Name of the expected plan.
	 * @throws If the expected plan title is not found in the timeout period.
	 */
	async validateActivePlanInMyPlanTab( expectedPlan: Plan ): Promise< void > {
		await this.page.waitForSelector( selectors.myPlanTitle( expectedPlan ) );
	}

	/**
	 * Validates that the provided tab name is the the currently active tab in the wrapper Plans page. Throws if it isn't.
	 *
	 * @param {PlansPageTab} expectedTab Name of the expected tab.
	 * @throws If the expected tab name is not the active tab.
	 */
	async validateActiveNavigationTab( expectedTab: PlansPageTab ): Promise< void > {
		await this.page.waitForSelector( selectors.activeNavigationTab( expectedTab ) );
	}

	/**
	 * Click on the provided tab name in the navigation tab at the top of the Plans activity
	 *
	 * @param {PlansPageTab} targetTab Name of the navigation tab to click on
	 */
	async clickNavigationTab( targetTab: PlansPageTab ): Promise< void > {
		await this.page.click( selectors.navigationTab( targetTab ) );
		// make sure it actually got marked as active!
		await this.validateActiveNavigationTab( targetTab );
	}

	/**
	 * Click a plan action button (on the plan cards on the "Plans" tab) based on expected plan name and button text.
	 *
	 * @param {object} param0 Object containing plan name and button text
	 * @param {Plan} param0.plan Name of the plan (e.g. "Premium")
	 * @param {PlanActionButton} param0.buttonText Expected action button text (e.g. "Upgrade")
	 */
	async clickPlanActionButton( {
		plan,
		buttonText,
	}: {
		plan: Plan;
		buttonText: PlanActionButton;
	} ): Promise< void > {
		const selector = selectors.actionButton( {
			viewport: getTargetDeviceName(),
			plan: plan,
			buttonText: buttonText,
		} );
		// These action buttons trigger real page navigations.
		await Promise.all( [ this.page.waitForNavigation(), this.page.click( selector ) ] );
		await this.page.waitForLoadState( 'load' );
	}
}
