import { Page } from 'playwright';
import { toTitleCase } from '../../data-helper';
import { clickNavTab } from '../../element-helper';
import envVariables from '../../env-variables';

// Differentiates between the legacy and current (overhauled) plans.
type PlansGridVersion = 'current' | 'legacy';
type PlansComparisonAction = 'show' | 'hide';

// Types to restrict the string arguments passed in. These are fixed sets of strings, so we can be more restrictive.
export type Plans = 'start with a free site' | 'start with free' | 'Pro';
export type LegacyPlans = 'Free' | 'Personal' | 'Premium' | 'Business' | 'eCommerce';
export type PlansPageTab = 'My Plan' | 'Plans';
export type PlanActionButton = 'Manage plan' | 'Upgrade';

const selectors = {
	// Generic
	placeholder: `.is-placeholder`,

	// Navigation
	mobileNavTabsToggle: `button.section-nav__mobile-header`,
	navigationTab: ( tabName: PlansPageTab ) => `.section-nav-tab:has-text("${ tabName }")`,
	activeNavigationTab: ( tabName: PlansPageTab ) =>
		`.is-selected.section-nav-tab:has-text("${ tabName }")`,

	// Legacy plans view
	legacyPlansGrid: '.plans-features-main',
	actionButton: ( { plan, buttonText }: { plan: LegacyPlans; buttonText: PlanActionButton } ) => {
		const viewportSuffix = envVariables.VIEWPORT_NAME === 'mobile' ? 'mobile' : 'table';
		return `.plan-features__${ viewportSuffix } >> .plan-features__actions-button.is-${ plan.toLowerCase() }-plan:has-text("${ buttonText }")`;
	},

	// Overhauled plans view
	selectPlanButton: ( type: Plans ) =>
		`.formatted-header button.button:has-text("${ type }"), tr th button.button:has-text("${ type }")`,
	// upgradeToProButton: 'th button.is-primary',
	planComparisonActionButton: ( action: PlansComparisonAction ) => {
		const buttonText = `${ toTitleCase( action ) } full plan comparison`;
		return `button:text("${ buttonText }")`;
	},

	// My Plans view
	myPlanTitle: ( planName: LegacyPlans ) => `.my-plan-card__title:has-text("${ planName }")`,
};

/**
 * Page representing the Plans page accessible at Upgrades >> Plans
 */
export class PlansPage {
	private page: Page;
	private version: PlansGridVersion;

	/**
	 * Constructs an instance of the Plans POM.
	 *
	 * @param {Page} page Instance of the Playwright page
	 */
	constructor( page: Page, version: PlansGridVersion ) {
		this.page = page;
		this.version = version;
	}

	/**
	 * Wait until the page is loaded and stable.
	 */
	private async waitUntilLoaded(): Promise< void > {
		await this.page.waitForLoadState( 'load' );
	}

	/* Current Plans */

	/**
	 * Selects the target plan on the plans grid.
	 *
	 * @param {Plans} plan Plan to select.
	 */
	async selectPlan( plan: Plans ): Promise< void > {
		const locator = this.page.locator( selectors.selectPlanButton( plan ) );
		await Promise.all( [ this.page.waitForNavigation(), locator.click() ] );
	}

	/**
	 * Shows the full Plan comparison table.
	 *
	 * This method is applicable only to the overhauled plans.
	 */
	async showPlanComparison(): Promise< void > {
		const buttonLocator = this.page.locator( selectors.planComparisonActionButton( 'show' ) );
		await buttonLocator.click();

		const hideButtonLocator = this.page.locator( selectors.planComparisonActionButton( 'hide' ) );
		await hideButtonLocator.waitFor();
	}

	/**
	 * Hides the full Plan comparison table.
	 *
	 * This method is applicable only to the overhauled plans.
	 */
	async hidePlanComparison(): Promise< void > {
		const buttonLocator = this.page.locator( selectors.planComparisonActionButton( 'hide' ) );
		await buttonLocator.click();

		const showButtonLocator = this.page.locator( selectors.planComparisonActionButton( 'show' ) );
		await showButtonLocator.waitFor();
	}

	/* Legacy Plans */

	/**
	 * Clicks on the navigation tab (desktop) or dropdown (mobile).
	 *
	 * @param {PlansPageTab} targetTab Name of the tab.
	 */
	async clickTab( targetTab: PlansPageTab ): Promise< void > {
		// Plans page against the current WordPress.com Plans do not
		// require any clicking of navigation tabs.
		if ( this.version === 'current' ) {
			return;
		}

		// If the target tab is already active, short circuit.
		const currentSelectedLocator = this.page.locator( selectors.activeNavigationTab( targetTab ) );
		if ( ( await currentSelectedLocator.count() ) > 0 ) {
			return;
		}

		if ( targetTab === 'My Plan' ) {
			// User is currently on the Plans tab and going to My Plans.
			// Wait for the Plans grid to fully render.
			const plansGridLocator = this.page.locator( selectors.legacyPlansGrid );
			await plansGridLocator.waitFor();
		}
		if ( targetTab === 'Plans' ) {
			// User is currently on the My Plans tab and going to Plans.
			// Wait for the detais of the current plan to complete rendering
			// asynchronously.
			const placeholderLocator = this.page.locator( `.my-plan-card${ selectors.placeholder }` );
			await placeholderLocator.waitFor( { state: 'hidden' } );
		}
		await clickNavTab( this.page, targetTab );
	}

	/**
	 * Validates that the provided plan name is the title of the active plan in the My Plan tab of the Plans page. Throws if it isn't.
	 *
	 * @param {LegacyPlans} expectedPlan Name of the expected plan.
	 * @throws If the expected plan title is not found in the timeout period.
	 */
	async validateActivePlanInMyPlanTab( expectedPlan: LegacyPlans ): Promise< void > {
		const expectedPlanLocator = this.page.locator( selectors.myPlanTitle( expectedPlan ) );
		await expectedPlanLocator.waitFor();
	}

	/**
	 * Validates that the provided tab name is the the currently active tab in the wrapper Plans page. Throws if it isn't.
	 *
	 * @param {PlansPageTab} expectedTab Name of the expected tab.
	 * @throws If the expected tab name is not the active tab.
	 */
	async validateActiveNavigationTab( expectedTab: PlansPageTab ): Promise< void > {
		// For mobile sized viewport, the currently selected tab name
		// is hidden behind a pseudo-dropdown.
		// Therefore the valicdation will look for hidden element.
		const currentSelectedLocator = this.page.locator(
			selectors.activeNavigationTab( expectedTab )
		);
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			await currentSelectedLocator.waitFor( { state: 'hidden' } );
		} else {
			await currentSelectedLocator.waitFor();
		}
	}

	/**
	 * Click a plan action button (on the plan cards on the "Plans" tab) based on expected plan name and button text.
	 *
	 * @param {object} param0 Object containing plan name and button text
	 * @param {LegacyPlans} param0.plan Name of the plan (e.g. "Premium")
	 * @param {PlanActionButton} param0.buttonText Expected action button text (e.g. "Upgrade")
	 */
	async clickPlanActionButton( {
		plan,
		buttonText,
	}: {
		plan: LegacyPlans;
		buttonText: PlanActionButton;
	} ): Promise< void > {
		const selector = selectors.actionButton( {
			plan: plan,
			buttonText: buttonText,
		} );
		// These action buttons trigger real page navigations.
		await Promise.all( [ this.page.waitForNavigation(), this.page.click( selector ) ] );
	}
}
