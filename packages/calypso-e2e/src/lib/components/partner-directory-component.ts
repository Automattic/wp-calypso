import { envVariables } from '../..';
import type { Locator, Page } from 'playwright';

const selectors = {
	// TODO: This button has no accessible name, so we have to use a CSS selector.
	filtersToggle: '.a4a-partner-directory-filters-toggle',
	helpCenterButton: 'button.wpcom-help-center-fab',
};

/**
 * Component representing the a partner directory block.
 */
export class PartnerDirectoryComponent {
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
	 * Apply a dropdown filter to the partner directory.
	 *
	 * @param {string} dropdownName The name of the dropdown to apply the filter to.
	 * @param {string} filterName The name of the filter to apply.
	 */
	async applyDropdownFilter( dropdownName: string, filterName: string ): Promise< void > {
		await this.deactivateHelpCenterButton();

		// On mobile, we need to click the filters toggle button first to open the filters panel.
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			const filtersToggle = this.page.locator( selectors.filtersToggle );
			await this.scrollToCenterOfViewport( filtersToggle );
			await filtersToggle.click();
		}

		const dropdown = this.page.getByRole( 'button', { name: dropdownName } );
		await this.scrollToCenterOfViewport( dropdown );
		await dropdown.click();

		const filter = this.page.getByRole( 'checkbox', { name: filterName } );
		await this.scrollToCenterOfViewport( filter );
		await filter.click();
	}

	/**
	 * Wait for the filter to be applied.
	 */
	async waitForFilterToBeApplied(): Promise< void > {
		await this.page.waitForSelector( 'text=/\\d+ partners found for filters/', {
			timeout: 10000,
		} );
	}

	/**
	 * Click the first partner in the partner directory.
	 */
	async clickFirstPartner(): Promise< void > {
		const partner = this.page.getByRole( 'link', { name: 'Accepting new clients' } ).first();

		await this.scrollToCenterOfViewport( partner );
		await partner.click();
	}

	/**
	 * Stops the floating Help Center button from swallowing clicks aimed at the
	 * directory. The button is injected asynchronously and hovers over the page
	 * content, so it can cover the directory controls on narrow viewports.
	 */
	private async deactivateHelpCenterButton(): Promise< void > {
		await this.page.addStyleTag( {
			content: `${ selectors.helpCenterButton } { pointer-events: none !important; }`,
		} );
	}

	/**
	 * Scrolls the target to the middle of the viewport, then waits for its
	 * position to settle.
	 *
	 * The directory is embedded in a marketing page topped by a sticky global
	 * navigation. Playwright only scrolls a target just far enough to be in view,
	 * which on narrow viewports leaves it beneath that navigation, and the
	 * scroll-linked reflow of the navigation keeps moving the target from under
	 * the pointer.
	 *
	 * @param {Locator} locator The target to bring into view.
	 */
	private async scrollToCenterOfViewport( locator: Locator ): Promise< void > {
		await locator.waitFor( { state: 'visible' } );

		await locator.evaluate( ( element ) => {
			element.scrollIntoView( { block: 'center', behavior: 'instant' } );

			return new Promise< void >( ( resolve ) => {
				const maxFrames = 100;
				const requiredStableFrames = 3;
				let previousTop: number | undefined;
				let stableFrames = 0;
				let frames = 0;

				const measure = () => {
					const { top } = element.getBoundingClientRect();
					stableFrames = top === previousTop ? stableFrames + 1 : 0;
					previousTop = top;
					frames += 1;

					if ( stableFrames >= requiredStableFrames || frames >= maxFrames ) {
						resolve();
						return;
					}

					requestAnimationFrame( measure );
				};

				requestAnimationFrame( measure );
			} );
		} );
	}
}
