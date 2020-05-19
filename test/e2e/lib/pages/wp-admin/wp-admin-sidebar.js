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
		const plugInMenuSelector = by.css( '#menu-plugins' );
		const plugInMenuItemSelector = by.css( '#menu-plugins li a[href="plugins.php"]' );

		return await this._selectMenuItem( plugInMenuSelector, plugInMenuItemSelector );
	}

	async selectJetpack() {
		const jetpackMenuSelector = by.css( '#toplevel_page_jetpack' );
		const menuItemSelector = by.css(
			'#toplevel_page_jetpack a[href$="jetpack#/dashboard"], #toplevel_page_jetpack a[href$="jetpack"]'
		);

		return await this._selectMenuItem( jetpackMenuSelector, menuItemSelector );
	}

	async selectJetpackSettings() {
		const jetpackMenuSelector = by.css( '#toplevel_page_jetpack' );
		const menuItemSelector = by.css( '#toplevel_page_jetpack li a[href$="jetpack#/settings"]' );

		return await this._selectMenuItem( jetpackMenuSelector, menuItemSelector );
	}

	async selectSettingsSharing() {
		const settingsSelector = by.css( '#menu-settings' );
		const itemSelector = by.css( '#menu-settings a[href$="sharing"]' );

		return await this._selectMenuItem( settingsSelector, itemSelector );
	}

	async selectSnippets() {
		const settingsSelector = by.css( '#toplevel_page_snippets' );
		const itemSelector = by.css( '#toplevel_page_snippets a.wp-first-item[href$="snippets"]' );

		return await this._selectMenuItem( settingsSelector, itemSelector );
	}

	async selectAppearanceEditCSS() {
		const settingsSelector = by.css( '#menu-appearance' );
		const itemSelector = by.css( '#menu-appearance a[href$="editcss"]' );

		return await this._selectMenuItem( settingsSelector, itemSelector );
	}

	async selectAddNewUser() {
		const usersSelector = by.css( '#menu-users' );
		const itemSelector = by.css( '#menu-users a[href*="user-new"]' );

		return await this._selectMenuItem( usersSelector, itemSelector );
	}

	async selectAllPosts() {
		const postsSelector = by.css( '#menu-posts' );
		const itemSelector = by.css( '#menu-posts a[href*="edit"]' );

		return await this._selectMenuItem( postsSelector, itemSelector );
	}

	async selectNewPost() {
		const postsSelector = by.css( '#menu-posts' );
		const itemSelector = by.css( '#menu-posts a[href*="post-new"]' );

		return await this._selectMenuItem( postsSelector, itemSelector );
	}

	async _selectMenuItem( menuSelector, menuItemSelector ) {
		const classes = await this.driver.findElement( menuSelector ).getAttribute( 'class' );
		if ( ! classes.includes( 'wp-menu-open' ) && ! classes.includes( 'wp-has-current-submenu' ) ) {
			await driverHelper.clickWhenClickable( this.driver, menuSelector );
		}
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			return await driverHelper.followLinkWhenFollowable( this.driver, menuItemSelector );
		}
		return await driverHelper.clickWhenClickable( this.driver, menuItemSelector );
	}

	static async refreshIfJNError( driver ) {
		return await driverHelper.refreshIfJNError( driver );
	}
}
