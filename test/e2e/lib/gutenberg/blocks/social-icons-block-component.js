/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import GutenbergBlockComponent from './gutenberg-block-component';

const SocialIconsBlockSelector = By.css( '.wp-block-social-links' );

export default class SocialIconsBlockComponent extends GutenbergBlockComponent {
	/**
	 * add the individual social icon to the social icon block
	 *
	 * @param iconBlockName block to add
	 * @param url url for the block
	 */
	async addSocialIcon( iconBlockName, url ) {
		const iconInsertButtonSelector = By.css(
			'.wp-block-social-links .block-editor-inserter button[aria-label="Add block"]'
		);
		await driverHelper.clickWhenClickable( this.driver, iconInsertButtonSelector );

		await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.block-editor-inserter__search-input' ),
			iconBlockName
		);

		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `.block-editor-block-types-list button[class*="${ iconBlockName.toLowerCase() }"` )
		);

		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `.wp-block-social-links .wp-social-link-${ iconBlockName.toLowerCase() }` )
		);

		await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.block-editor-url-input__input' ),
			url
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `.block-editor-url-popover__link-editor button` )
		);
	}

	/**
	 * remove the individual social icon from the social icon block
	 *
	 * @param iconBlockName block to add
	 */
	async removeSocialIcon( iconBlockName ) {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `.wp-block-social-links .wp-social-link-${ iconBlockName.toLowerCase() }` )
		);

		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `.block-editor-block-toolbar .components-dropdown-menu button[aria-label="Options"]` )
		);

		// Currently have to click twice or else the delete fails
		const removeBlockSelector = By.xpath( `//button[span="Remove block"]` );
		await driverHelper.clickWhenClickable( this.driver, removeBlockSelector );

		if ( await driverHelper.isElementPresent( this.driver, removeBlockSelector ) ) {
			await driverHelper.clickWhenClickable( this.driver, removeBlockSelector );
		}
	}

	/**
	 * edit the URL for an individual social icon in the social icon block
	 *
	 * @param iconBlockName block to edit
	 * @param url url for the block
	 */
	async editSocialIconURL( iconBlockName, url ) {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `.wp-block-social-links .wp-social-link-${ iconBlockName.toLowerCase() }` )
		);

		await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.block-editor-url-input__input' ),
			url
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `.block-editor-url-popover__link-editor button` )
		);
	}

	/**
	 * sets the alignment of the social icons
	 *
	 * @param alignmentButtonText button alignment text (eg. Align left, Align centre, Align right)
	 */
	async setAlignment( alignmentButtonText ) {
		const alignmentSelector = By.css( '.block-editor-block-toolbar button[aria-label="Align"]' );

		await driverHelper.waitTillPresentAndDisplayed( this.driver, SocialIconsBlockSelector );
		if ( await driverHelper.elementIsNotPresent( this.driver, alignmentSelector ) ) {
			await driverHelper.clickWhenClickable( this.driver, SocialIconsBlockSelector );
		}

		await driverHelper.waitTillPresentAndDisplayed( this.driver, alignmentSelector );
		await driverHelper.clickWhenClickable( this.driver, alignmentSelector );

		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.components-popover__content' )
		);

		await driverHelper.clickWhenClickable(
			this.driver,
			By.xpath( `//button[text()="${ alignmentButtonText }"]` )
		);
	}

	/**
	 * sets the size of the social icons
	 *
	 * @param iconSize - Size of the icon (Small, Normal, Large, Huge)
	 */
	async setSize( iconSize ) {
		const sizeSelector = By.css( '.block-editor-block-toolbar button[aria-label="Size"]' );

		await driverHelper.waitTillPresentAndDisplayed( this.driver, SocialIconsBlockSelector );

		if ( await driverHelper.elementIsNotPresent( this.driver, sizeSelector ) ) {
			await driverHelper.clickWhenClickable( this.driver, SocialIconsBlockSelector );
		}
		await driverHelper.waitTillPresentAndDisplayed( this.driver, sizeSelector );
		await driverHelper.clickWhenClickable( this.driver, sizeSelector );

		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.components-menu-group' )
		);

		await driverHelper.clickWhenClickable(
			this.driver,
			By.xpath( `//button[span="${ iconSize }"]` )
		);
	}
}

export { SocialIconsBlockComponent };
