/**
 * External dependencies
 */
import { By, Key } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';
import AsyncBaseContainer from '../async-base-container';
import * as driverManager from '../driver-manager';
import * as SlackNotifier from '../slack-notifier';
import GutenbergEditorComponent from './gutenberg-editor-component';

export default class GutenbergEditorSidebarComponent extends AsyncBaseContainer {
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

	async expandPermalink() {
		return await this._expandOrCollapseSectionByText( 'Permalink', true );
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

	async expandExcerpt() {
		return await this._expandOrCollapseSectionByText( 'Excerpt', true );
	}

	async expandDiscussion() {
		return await this._expandOrCollapseSectionByText( 'Discussion', true );
	}

	async collapseStatusAndVisibility() {
		return await this._expandOrCollapseSectionByText( 'Status & visibility', false );
	}

	async collapsePermalink() {
		return await this._expandOrCollapseSectionByText( 'Permalink', false );
	}

	async collapseCategories() {
		return await this._expandOrCollapseSectionByText( 'Categories', false );
	}

	async collapseTags() {
		return await this._expandOrCollapseSectionByText( 'Tags', false );
	}

	async collapseFeaturedImage() {
		return await this._expandOrCollapseSectionByText( 'Featured Image', false );
	}

	async collapseExcerpt() {
		return await this._expandOrCollapseSectionByText( 'Excerpt', false );
	}

	async collapseDiscussion() {
		return await this._expandOrCollapseSectionByText( 'Discussion', false );
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



	async _postInit() {
		return await this.displayComponentIfNecessary();
	}
}
