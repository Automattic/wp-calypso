import { Page } from 'playwright';

/**
 * Page representing the WP-ADMIN page for media settings, which we use on WPCOM sites.
 * It's at wp-admin/options-media.php
 */
export class WpAdminMediaSettingsPage {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Toggle the "Display images in full-size carousel slideshow" checkbox.
	 */
	async toggleEnableCarousel() {
		const locator = this.page.getByRole( 'checkbox', {
			name: 'Display images in full-size carousel slideshow.',
		} );

		await locator.click();
	}

	/**
	 * Toggle the "Show photo metadata (Exif) in carousel, when available." checkbox.
	 */
	async toggleCarouselMetadata() {
		const locator = this.page.getByRole( 'checkbox', {
			name: 'Show photo metadata (Exif) in carousel, when available.',
		} );

		await locator.click();
	}

	/**
	 * Set the background color for the carousel.
	 *
	 * @param color The background color to set for the carousel.
	 */
	async setBackGroundColor( color: 'Black' | 'White' ) {
		// No accessible name, yikes! :(
		const locator = this.page.locator( '#carousel_background_color' );

		await locator.selectOption( color );
	}
}
