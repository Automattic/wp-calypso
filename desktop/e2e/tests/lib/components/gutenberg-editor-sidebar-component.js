/**
 * External dependencies
 */
const webdriver = require( 'selenium-webdriver' );

/**
 * Internal dependencies
 */
const driverHelper = require( '../driver-helper' );
const AsyncBaseContainer = require( '../async-base-container' );

const By = webdriver.By;

class GutenbergEditorSidebarComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.edit-post-header' ) );
	}

	async selectTab( name ) {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `.edit-post-sidebar__panel-tab[aria-label^=${ name }]` )
		);
	}
	async selectDocumentTab() {
		await this.selectTab( 'Document' );
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.components-panel' )
		);
	}

	async expandStatusAndVisibility() {
		return await this._expandOrCollapseSectionByText( 'Status & visibility', true );
	}

	async expandCategories() {
		return await this._expandOrCollapseSectionByText( 'Categories', true );
	}

	async expandTags() {
		return await this._expandOrCollapseSectionByText( 'Tags', true );
	}

	async expandFeaturedImage() {
		return await this._expandOrCollapseSectionByText( 'Featured Image', true );
	}

	async expandDiscussion() {
		return await this._expandOrCollapseSectionByText( 'Discussion', true );
	}

	async collapseStatusAndVisibility() {
		return await this._expandOrCollapseSectionByText( 'Status & visibility', false );
	}

	async collapseCategories() {
		return await this._expandOrCollapseSectionByText( 'Categories', false );
	}

	async collapseTags() {
		return await this._expandOrCollapseSectionByText( 'Tags', false );
	}

	async _expandOrCollapseSectionByText( text, expand = true ) {
		const sectionSelector = await driverHelper.getElementByText(
			this.driver,
			By.css( '.components-panel__body-toggle' ),
			text
		);
		await driverHelper.waitTillPresentAndDisplayed( this.driver, sectionSelector );
		const sectionButton = await this.driver.findElement( sectionSelector );
		const c = await sectionButton.getAttribute( 'aria-expanded' );
		if ( expand && c === 'false' ) {
			await driverHelper.scrollIntoView( this.driver, sectionSelector );
			return await sectionButton.click();
		}
		if ( ! expand && c === 'true' ) {
			await driverHelper.scrollIntoView( this.driver, sectionSelector );
			return await sectionButton.click();
		}
	}
}

module.exports = GutenbergEditorSidebarComponent;
