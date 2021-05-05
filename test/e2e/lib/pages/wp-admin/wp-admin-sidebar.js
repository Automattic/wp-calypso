/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverManager from '../../driver-manager';
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WPAdminSidebar extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#adminmenumain' ) );
	}

	async _postInit() {
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			await this.driver
				.findElement( by.css( '#wpwrap' ) )
				.getAttribute( 'class' )
				.then( ( classValue ) => {
					if ( classValue !== 'wp-responsive-open' ) {
						driverHelper.clickWhenClickable( this.driver, by.css( '#wp-admin-bar-menu-toggle' ) );
					}
				} );
		}
	}

	async selectPlugins() {
		const plugInMenuLocator = by.css( '#menu-plugins' );
		const plugInMenuItemLocator = by.css( '#menu-plugins li a[href="plugins.php"]' );

		return await this._selectMenuItem( plugInMenuLocator, plugInMenuItemLocator );
	}

	async selectJetpack() {
		const jetpackMenuLocator = by.css( '#toplevel_page_jetpack' );
		const menuItemLocator = by.css(
			'#toplevel_page_jetpack li a[href$="jetpack#/dashboard"], ' +
				'#toplevel_page_jetpack li a[href$="jetpack"]'
		);

		return await this._selectMenuItem( jetpackMenuLocator, menuItemLocator );
	}

	async selectJetpackSettings() {
		const jetpackMenuLocator = by.css( '#toplevel_page_jetpack' );
		const menuItemLocator = by.css( '#toplevel_page_jetpack li a[href$="jetpack#/settings"]' );

		return await this._selectMenuItem( jetpackMenuLocator, menuItemLocator );
	}

	async selectSettingsSharing() {
		const settingsLocator = by.css( '#menu-settings' );
		const itemLocator = by.css( '#menu-settings a[href$="sharing"]' );

		return await this._selectMenuItem( settingsLocator, itemLocator );
	}

	async selectSnippets() {
		const settingsLocator = by.css( '#toplevel_page_snippets' );
		const itemLocator = by.css( '#toplevel_page_snippets a.wp-first-item[href$="snippets"]' );

		return await this._selectMenuItem( settingsLocator, itemLocator );
	}

	async selectAppearanceEditCSS() {
		const settingsLocator = by.css( '#menu-appearance' );
		const itemLocator = by.css( '#menu-appearance a[href$="editcss"]' );

		return await this._selectMenuItem( settingsLocator, itemLocator );
	}

	async selectAddNewUser() {
		const usersLocator = by.css( '#menu-users' );
		const itemLocator = by.css( '#menu-users a[href*="user-new"]' );

		return await this._selectMenuItem( usersLocator, itemLocator );
	}

	async selectAllPosts() {
		const postsLocator = by.css( '#menu-posts' );
		const itemLocator = by.css( '#menu-posts a[href*="edit"]' );

		return await this._selectMenuItem( postsLocator, itemLocator );
	}

	async selectNewPost() {
		const postsLocator = by.css( '#menu-posts' );
		const itemLocator = by.css( '#menu-posts a[href*="post-new"]' );

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
