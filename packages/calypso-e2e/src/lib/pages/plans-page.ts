import { Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';
import { clickNavTab } from '../../element-helper';
import envVariables from '../../env-variables';

// Types to restrict the string arguments passed in. These are fixed sets of strings, so we can be more restrictive.
export type Plans = 'Free' | 'Personal' | 'Premium' | 'Business' | 'eCommerce';
export type PlansPageTab = 'My Plan' | 'Plans';
export type PlanActionButton = 'Manage plan' | 'Upgrade';

const selectors = {
	// Generic
	placeholder: `.is-placeholder`,
	managePlanButton: `a:has-text("Manage plan")`,
	selectPlanButton: ( name: Plans ) => {
		if ( name === 'Free' ) {
			// Free plan is a pseudo-button presented as a
			// link.
			return `button:text-matches("${ name }", "i")`;
		}
		return `button.is-${ name.toLowerCase() }-plan:visible`;
	},

	// Navigation
	mobileNavTabsToggle: `button.section-nav__mobile-header`,
	navigationTab: ( tabName: PlansPageTab ) => `.section-nav-tab:has-text("${ tabName }")`,
	activeNavigationTab: ( tabName: PlansPageTab ) =>
		`.is-selected.section-nav-tab:has-text("${ tabName }")`,

	// Legacy plans view
	PlansGrid: '.plans-features-main',
	actionButton: ( { plan, buttonText }: { plan: Plans; buttonText: PlanActionButton } ) => {
		const viewportSuffix = envVariables.VIEWPORT_NAME === 'mobile' ? 'mobile' : 'table';
		return `.plan-features__${ viewportSuffix } >> .plan-features__actions-button.is-${ plan.toLowerCase() }-plan:has-text("${ buttonText }")`;
	},

	// My Plans view
	myPlanTitle: ( planName: Plans ) => `.my-plan-card__title:has-text("${ planName }")`,
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
	 * Visits the Plans page.
	 *
	 * @param {PlansPageTab} target Target page.
	 * @param {string} siteSlug Site slug.
	 */
	async visit( target: PlansPageTab, siteSlug: string ): Promise< void > {
		const sanitized = target.toLowerCase().replace( ' ', '-' );

		if ( target === 'My Plan' ) {
			await this.page.goto( getCalypsoURL( `plans/${ sanitized }/${ siteSlug }` ) );
		}

		if ( target === 'Plans' ) {
			await this.page.goto( getCalypsoURL( `plans/${ siteSlug }` ) );
		}
	}

	/* Plans */

	/**
	 * Selects the target plan on the plans grid.
	 *
	 * @param {Plans} plan Plan to select.
	 */
	async selectPlan( plan: Plans ): Promise< void > {
		const locator = this.page.locator( selectors.selectPlanButton( plan ) );
		// In the /plans view, there are two buttons for "Upgrade" on the
		// plan comparison chart.
		await Promise.all( [
			this.page.waitForNavigation( { timeout: 30 * 1000 } ),
			locator.first().click(),
		] );
	}

	/* Generic */

	/**
	 * Validates that the provided plan name is the title of the active plan in the My Plan tab of the Plans page. Throws if it isn't.
	 *
	 * @param {Plans} expectedPlan Name of the expected plan.
	 * @throws If the expected plan title is not found in the timeout period.
	 */
	async validateActivePlan( expectedPlan: Plans ): Promise< void > {
		const expectedPlanLocator = this.page.locator( selectors.myPlanTitle( expectedPlan ) );
		await expectedPlanLocator.waitFor();
	}

	/**
	 * Clicks on the "Manage plan" button, which can be found in the My Plan tab.
	 */
	async clickManagePlan(): Promise< void > {
		await this.page.click( selectors.managePlanButton );
	}

	/**
	 * Validates that the provided tab name is the the currently active tab in the wrapper Plans page. Throws if it isn't.
	 *
	 * @param {PlansPageTab} expectedTab Name of the expected tab.
	 * @throws If the expected tab name is not the active tab.
	 */
	async validateActiveTab( expectedTab: PlansPageTab ): Promise< void > {
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
	 * Clicks on the navigation tab (desktop) or dropdown (mobile).
	 *
	 * @param {PlansPageTab} targetTab Name of the tab.
	 */
	async clickTab( targetTab: PlansPageTab ): Promise< void > {
		// The way PlansPage loads its contents is particularly prone to
		// flakiness outside the control of Playwright auto-retry mechanism.
		// To work around this, forcibly click on the target selector
		// once everything has been loaded.
		// This affects primarily Mobile viewports but also can also occur
		// on Desktop viewports.
		// See https://github.com/Automattic/wp-calypso/issues/64389
		// and https://github.com/Automattic/wp-calypso/pull/64421#discussion_r892589761.
		await Promise.all( [
			this.page.waitForLoadState( 'networkidle', { timeout: 20 * 1000 } ),
			this.page.waitForResponse( /.*active-promotions.*/ ),
		] );
		await clickNavTab( this.page, targetTab, { force: true } );
	}

	/**
	 * Click a plan action button (on the plan cards on the "Plans" tab) based on expected plan name and button text.
	 *
	 * @param {Object} param0 Object containing plan name and button text
	 * @param {Plans} param0.plan Name of the plan (e.g. "Premium")
	 * @param {PlanActionButton} param0.buttonText Expected action button text (e.g. "Upgrade")
	 */
	async clickPlanActionButton( {
		plan,
		buttonText,
	}: {
		plan: Plans;
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
