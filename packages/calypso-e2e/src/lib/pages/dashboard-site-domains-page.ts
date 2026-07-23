import { Page } from 'playwright';
import { getDashboardURL } from '../../data-helper';

/**
 * Page representing a single site's Domains screen (`/sites/:slug/domains`) in
 * the Multi-site Dashboard.
 */
export class DashboardSiteDomainsPage {
	private static readonly DOMAINS_PATH_REGEX = /^\/sites\/[^/]+\/domains(?:\/|$)/;

	private page: Page;

	/**
	 * Constructs an instance of the page.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Waits until the browser is on this site's Domains screen in the Multi-site
	 * Dashboard.
	 *
	 * Guards against acting on the wrong page (eg. after an unexpected redirect):
	 * waiting for the domains URL first frames such a failure clearly instead of
	 * surfacing a confusing missing-button locator error.
	 */
	private async waitForPageLoaded(): Promise< void > {
		const dashboardHost = new URL( getDashboardURL() ).host;
		await this.page.waitForURL(
			( url ) =>
				url.host === dashboardHost &&
				DashboardSiteDomainsPage.DOMAINS_PATH_REGEX.test( url.pathname )
		);
	}

	/**
	 * Opens the "Add domain name" menu and selects the option to search for a
	 * new domain, which hands off to the domain search flow.
	 */
	async searchForNewDomain(): Promise< void > {
		await this.waitForPageLoaded();
		await this.page.getByRole( 'button', { name: 'Add domain name', exact: true } ).click();
		await this.page.getByRole( 'menuitem', { name: 'Search domain names', exact: true } ).click();
	}
}
