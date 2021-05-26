/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverManager from '../../driver-manager';
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WPAdminSidebar extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#adminmenumain' ) );
	}

	async _postInit() {
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			await this.driver
				.findElement( By.css( '#wpwrap' ) )
				.getAttribute( 'class' )
				.then( ( classValue ) => {
					if ( classValue !== 'wp-responsive-open' ) {
						driverHelper.clickWhenClickable( this.driver, By.css( '#wp-admin-bar-menu-toggle' ) );
					}
				} );
		}
	}

	async selectPlugins() {
		const plugInMenuLocator = By.css( '#menu-plugins' );
		const plugInMenuItemLocator = By.css( '#menu-plugins li a[href="plugins.php"]' );

		return await this._selectMenuItem( plugInMenuLocator, plugInMenuItemLocator );
	}

	async selectJetpack() {
		const jetpackMenuLocator = By.css( '#toplevel_page_jetpack' );
		const menuItemLocator = By.css(
			'#toplevel_page_jetpack li a[href$="jetpack#/dashboard"], ' +
				'#toplevel_page_jetpack li a[href$="jetpack"]'
		);

		return await this._selectMenuItem( jetpackMenuLocator, menuItemLocator );
	}

	async selectJetpackSettings() {
		const jetpackMenuLocator = By.css( '#toplevel_page_jetpack' );
		const menuItemLocator = By.css( '#toplevel_page_jetpack li a[href$="jetpack#/settings"]' );

		return await this._selectMenuItem( jetpackMenuLocator, menuItemLocator );
	}

	async selectSettingsSharing() {
		const settingsLocator = By.css( '#menu-settings' );
		const itemLocator = By.css( '#menu-settings a[href$="sharing"]' );

		return await this._selectMenuItem( settingsLocator, itemLocator );
	}

	async selectSnippets() {
		const settingsLocator = By.css( '#toplevel_page_snippets' );
		const itemLocator = By.css( '#toplevel_page_snippets a.wp-first-item[href$="snippets"]' );

		return await this._selectMenuItem( settingsLocator, itemLocator );
	}

	async selectAppearanceEditCSS() {
		const settingsLocator = By.css( '#menu-appearance' );
		const itemLocator = By.css( '#menu-appearance a[href$="editcss"]' );

		return await this._selectMenuItem( settingsLocator, itemLocator );
	}

	async selectAddNewUser() {
		const usersLocator = By.css( '#menu-users' );
		const itemLocator = By.css( '#menu-users a[href*="user-new"]' );

		return await this._selectMenuItem( usersLocator, itemLocator );
	}

	async selectAllPosts() {
		const postsLocator = By.css( '#menu-posts' );
		const itemLocator = By.css( '#menu-posts a[href*="edit"]' );

		return await this._selectMenuItem( postsLocator, itemLocator );
	}

	async selectNewPost() {
		const postsLocator = By.css( '#menu-posts' );
		const itemLocator = By.css( '#menu-posts a[href*="post-new"]' );

		return await this._selectMenuItem( postsLocator, itemLocator );
	}

	async _selectMenuItem( menuLocator, menuItemLocator ) {
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, menuLocator );
		const classes = await this.driver.findElement( menuLocator ).getAttribute( 'class' );
		if ( ! classes.includes( 'wp-menu-open' ) && ! classes.includes( 'wp-has-current-submenu' ) ) {
			await driverHelper.clickWhenClickable( this.driver, menuLocator );
			await driverHelper.waitUntilElementLocatedAndVisible( this.driver, menuItemLocator );
		}
		return await driverHelper.clickWhenClickable( this.driver, menuItemLocator );
	}

	static async refreshIfJNError( driver ) {
		return await driverHelper.refreshIfJNError( driver );
	}
}
