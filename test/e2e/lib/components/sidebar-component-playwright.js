export default class SidebarComponent {
	constructor( page ) {
		// Selectors
		this.sidebarSelector = '.sidebar';

		this.page = page;

		this._init();
	}

	async _init() {
		return await this.page.waitForSelector( this.sidebarSelector );
	}

	async expandDrawerItem( itemName ) {
		// itemName should reflect the text as rendered for the side pane item
		// that should be clicked.
		// In a production system, itemName should be subjected to sanitization
		// to prevent case errors from breaking the test.

		// Note this selector is plural - the intention is to select all matching
		// selectors, then iterate through each item and check its innerText attribute.
		const sidebarMenuSelectors = 'css=.sidebar >> css=.is-togglable';
		// Once drawer is toggled, this CSS class is added.
		const drawerOpen = 'is-toggle-open';

		const handles = await this.page.$$( sidebarMenuSelectors );

		for ( const h of handles ) {
			// Yay, there was a match. Let's click on the element to expand it.
			if ( ( await h.innerText() ) === itemName ) {
				await h.click();
				// Ensure we were actually successful in toggling open the drawer.
				return await this.page.waitForSelector( drawerOpen );
			}
		}
	}

	async selectMarketing() {
		this.expandDrawerItem( 'Tools' );
		// Promise that will resolve on page navigation event firing.
		this.page.waitForNavigation();
		return await this.page.click( '.marketing' );
	}

	async selectSettings() {
		this.expandDrawerItem( 'Manage' );
		// Promise that will resolve on page navigation event firing.
		this.page.waitForNavigation();
		return await this.page.click( '.settings' );
	}
}
