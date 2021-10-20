import { By } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper';
import * as driverManager from '../driver-manager';
import GutenbergEditorComponent from '../gutenberg/gutenberg-editor-component';
import AbstractEditorComponent from './abstract-editor-component';

export default class SiteEditorComponent extends AbstractEditorComponent {
	constructor( driver, url, editorType = 'iframe' ) {
		super( driver, By.css( '.edit-site-header' ), url );
		this.editorType = editorType;

		this.editoriFrameLocator = By.css( '.calypsoify.is-iframe iframe.is-loaded' );
		this.editorCanvasiFrameLocator = By.css( 'iframe[name="editor-canvas"]' );
	}

	async runInCanvas( fn ) {
		await driverHelper.waitUntilAbleToSwitchToFrame( this.driver, this.editorCanvasiFrameLocator );
		const result = await fn();
		await this.driver.switchTo().parentFrame();
		return result;
	}

	async waitForTemplatePartsToLoad() {
		return await this.runInCanvas( async () => {
			await driverHelper.waitUntilElementNotLocated(
				this.driver,
				By.css( '.wp-block-template-part > .components-spinner' )
			);
			await driverHelper.waitUntilElementNotLocated(
				this.driver,
				By.css( '.wp-block-template-part > .block-editor-warning' )
			);
		} );
	}

	async waitForTemplateToLoad() {
		await this.runInCanvas( async () => {
			await driverHelper.waitUntilElementLocatedAndVisible(
				this.driver,
				By.css( '.edit-site-block-editor__block-list' )
			);
		} );
	}

	async isBlockInserterOpen() {
		const inserterMenuLocator = By.css( '.block-editor-inserter__menu' );
		return await driverHelper.isElementLocated( this.driver, inserterMenuLocator );
	}

	async openBlockInserter() {
		const inserterToggleLocator = By.css(
			'.edit-site-header .edit-site-header-toolbar__inserter-toggle'
		);
		if ( ! ( await this.isBlockInserterOpen() ) ) {
			await driverHelper.clickWhenClickable( this.driver, inserterToggleLocator );
		}

		const inserterMenuLocator = By.css( '.block-editor-inserter__menu' );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, inserterMenuLocator );
	}

	async insertPattern( category, name ) {
		await this.openBlockInserter();

		const patternTabLocator = By.css(
			'.block-editor-inserter__tabs .components-tab-panel__tabs-item[id$="patterns"]'
		);
		const patternCategoryDropdownLocator = By.css(
			'.components-tab-panel__tab-content .components-select-control__input'
		);
		const patternCategoryDropdownOptionLocator = By.css(
			`.components-tab-panel__tab-content .components-select-control__input option[value="${ category }"]`
		);
		const patternItemLocator = By.css(
			`.block-editor-block-patterns-list__list-item[aria-label="${ name }"]`
		);
		await driverHelper.clickWhenClickable( this.driver, patternTabLocator );
		await driverHelper.clickWhenClickable( this.driver, patternCategoryDropdownLocator );
		await driverHelper.clickWhenClickable( this.driver, patternCategoryDropdownOptionLocator );
		await driverHelper.clickWhenClickable( this.driver, patternCategoryDropdownLocator );
		await driverHelper.clickWhenClickable( this.driver, patternItemLocator );
	}

	async closeBlockInserter() {
		const inserterCloseLocator = By.css(
			driverManager.currentScreenSize() === 'mobile'
				? '.edit-site-editor__inserter-panel-header .components-button'
				: '.edit-site-header-toolbar__inserter-toggle'
		);
		const inserterMenuLocator = By.css( '.block-editor-inserter__menu' );
		await driverHelper.clickWhenClickable( this.driver, inserterCloseLocator );
		await driverHelper.waitUntilElementNotLocated( this.driver, inserterMenuLocator );
	}

	async addBlock( title, overrideLocatorSuffix, overrideAriaLabel ) {
		const {
			ariaLabel,
			prefix,
			blockClass,
			initsWithChildFocus,
		} = new GutenbergEditorComponent().getBlockLocatorSettings( title );

		const inserterBlockItemLocator = By.css(
			`.edit-site-editor__inserter-panel .block-editor-block-types-list button.editor-block-list-item-${
				overrideLocatorSuffix || prefix + blockClass
			}`
		);

		const insertedBlockLocator = By.css(
			`.block-editor-block-list__block.${
				initsWithChildFocus ? 'has-child-selected' : 'is-selected'
			}[aria-label*='${ overrideAriaLabel || ariaLabel }']`
		);

		await this.openBlockInserterAndSearch( title );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, inserterBlockItemLocator );
		// The normal click is needed to avoid hovering the element, which seems
		// to cause the element to become stale.
		await driverHelper.clickWhenClickable( this.driver, inserterBlockItemLocator );

		return await this.runInCanvas( async () => {
			await driverHelper.waitUntilElementLocatedAndVisible( this.driver, insertedBlockLocator );
			return await this.driver.findElement( insertedBlockLocator ).getAttribute( 'id' );
		} );
	}

	async toggleListView() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.edit-site-header-toolbar__list-view-toggle' )
		);
	}

	async removeBlock( blockID ) {
		await this.runInCanvas( async () => {
			const blockLocator = By.css( `.wp-block[id="${ blockID }"]` );
			await driverHelper.waitUntilElementLocatedAndVisible(
				this.driver,
				blockLocator,
				this.explicitWaitMS / 5
			);
			await this.driver.findElement( blockLocator ).click();
		} );

		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.block-editor-block-settings-menu' )
		);
		await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( '.components-menu-group' ),
			this.explicitWaitMS / 5
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css(
				'.components-menu-group:last-of-type button.components-menu-item__button:last-of-type'
			)
		);
	}

	async closeGlobalStyles() {
		if ( this.screenSize === 'mobile' ) {
			const globalStylesCloseButtonLocator = By.css(
				'button[aria-label="Close global styles sidebar"]'
			);
			return !! ( await driverHelper.clickIfPresent(
				this.driver,
				globalStylesCloseButtonLocator
			) );
		}

		const pressedGlobalStylesButtonLocator = By.css(
			'button[aria-label="Styles"][aria-expanded="true"]'
		);
		return !! ( await driverHelper.clickIfPresent(
			this.driver,
			pressedGlobalStylesButtonLocator
		) );
	}

	async toggleGlobalStyles() {
		if ( this.screenSize === 'mobile' ) {
			const closed = await driverHelper.clickIfPresent(
				this.driver,
				By.css( 'button[aria-label="Close global styles sidebar"]' )
			);

			if ( ! closed ) {
				await driverHelper.clickIfPresent(
					this.driver,
					By.css( 'button[aria-label="More tools & options"]' )
				);

				await driverHelper.clickWhenClickable(
					this.driver,
					driverHelper.createTextLocator( By.css( 'button[role="menuitemcheckbox"]' ), 'Styles' )
				);
			}
		} else {
			await driverHelper.clickWhenClickable( this.driver, By.css( 'button[aria-label="Styles"]' ) );
		}
	}

	async dismissNotices() {
		const snackbarNoticeLocator = By.css(
			'.components-snackbar[aria-label="Dismiss this notice"]'
		);

		const notices = await this.driver.findElements( snackbarNoticeLocator );
		for ( const notice of notices ) {
			await driverHelper.clickWhenClickable( this.driver, () => notice );
		}

		await driverHelper.waitUntilElementNotLocated( this.driver, snackbarNoticeLocator );
	}

	async toggleNavigationSidebar() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.edit-site-navigation-toggle__button' )
		);
	}

	async clickGlobalStylesResetButton() {
		return await driverHelper.clickIfPresent(
			this.driver,
			By.css(
				'.edit-site-global-styles-sidebar .edit-site-global-styles-sidebar__reset-button:enabled'
			)
		);
	}

	async changeGlobalStylesFontSize( value ) {
		return await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.edit-site-global-styles-sidebar .components-font-size-picker input' ),
			value
		);
	}

	async changeGlobalStylesColor( colorTypeIndex, colorValueIndex ) {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css(
				`.edit-site-global-styles-sidebar .block-editor-color-gradient-control:nth-of-type(${ colorTypeIndex }) .components-circular-option-picker__option-wrapper:nth-of-type(${ colorValueIndex }) .components-circular-option-picker__option`
			)
		);
	}

	async saveGlobalStyles( pauseAfter = false ) {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.edit-site-save-button__button' )
		);
		const allCheckboxes = await this.driver.findElements(
			By.css( '.entities-saved-states__panel .components-checkbox-control__input' )
		);
		for ( const checkbox of allCheckboxes ) {
			await driverHelper.setCheckbox( this.driver, () => checkbox, false );
		}
		const locator = driverHelper.createTextLocator(
			By.css( '.entities-saved-states__panel .components-checkbox-control__label' ),
			'Custom Styles'
		);
		await driverHelper.clickWhenClickable( this.driver, locator );
		const saveClicked = await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.editor-entities-saved-states__save-button' )
		);

		if ( pauseAfter ) {
			// The pause ensures there is enough time for the debounced tracking function to run,
			// and get/compare entities to create the tracks event.
			return await this.driver.sleep( 500 );
		}
		return saveClicked;
	}

	async changeGlobalStylesFirstColorPaletteItem( value, pickerOpened = false ) {
		if ( ! pickerOpened ) {
			await driverHelper.clickWhenClickable(
				this.driver,
				By.css(
					'.edit-site-global-styles-sidebar .components-base-control:last-of-type .components-color-edit__color-option button'
				)
			);
		}

		return await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.components-color-picker input' ),
			value
		);
	}

	async clickGlobalStylesMenuItem( menuTitle ) {
		const locator = driverHelper.createTextLocator(
			By.css( '.edit-site-global-styles-sidebar button' ),
			menuTitle
		);
		return await driverHelper.clickWhenClickable( this.driver, locator );
	}

	async clickGlobalStylesBackButton() {
		const backButtonLocator = By.css(
			'.edit-site-global-styles-sidebar button[aria-label="Navigate to the previous view"]'
		);
		return await driverHelper.clickWhenClickable( this.driver, backButtonLocator );
	}

	/**
	 * Alias for `toggleNavigationSidebar`. We need to have the same function
	 * name in both this and gutenberg editor component to make sure general
	 * tests are working as expected.
	 */
	toggleBlockEditorSidebar = this.toggleNavigationSidebar;
}
