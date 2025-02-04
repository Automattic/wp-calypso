import { Page } from 'playwright';
import { ElementHelper } from '../..';

/**
 * Represents the Revisions page used on Atomic sites.
 * For Simple sites see the RevisionsComponent.
 */
export class RevisionsPage {
	private page: Page;

	/**
	 * Creates an instance of the page.
	 *
	 * @param {Page} page Object representing the base page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Uses the revision slider to select a revision with given index.
	 *
	 * @param {number} index Revision number (1-based)
	 */
	async selectRevision( index: number ): Promise< void > {
		const sliderTickmarks = this.page.locator( '.revisions-tickmarks > div' );
		await sliderTickmarks.nth( 0 ).waitFor( { state: 'attached' } );
		const revisionCount = ( await sliderTickmarks.count() ) + 1;

		if ( index > revisionCount ) {
			throw new Error(
				`Incorrect revision number (${ index }). Available revisions: 1 - ${ revisionCount }`
			);
		}

		const slider = this.page.locator( '.wp-slider' );
		const sliderWidth = ( await slider.boundingBox() )?.width as number;
		// Calculate click position on the horizontal slider. For example, if
		// there are 4 revisions, the second one should be at 25% of the total
		// slider width.
		const clickPositionX = ( sliderWidth * ( index - 1 ) ) / ( revisionCount - 1 );

		await Promise.all( [
			// We need to rely on waiting for mutations here because neither
			// checking the ".loading" status nor the auto-waiting are enough to
			// indicate that the diff has been loaded and is ready to be
			// interacted with. This might be related to the fact that the diff
			// is rendered entirely from a fetched HTML string.
			ElementHelper.waitForMutations( this.page, '.revisions-diff-frame' ),
			slider.click( { position: { x: clickPositionX, y: 1 } } ),
		] );
	}

	/**
	 * Clicks the "Restore This Revision" button, then checks
	 * that the editor screen is loaded again.
	 *
	 * Throws if the current revision is already loaded.
	 *
	 * @throws {Error} if the current revision is already loaded.
	 */
	async loadSelectedRevision() {
		const restoreButton = this.page.locator( 'input[value="Restore This Revision"]' );
		if ( await restoreButton.isDisabled() ) {
			throw new Error( 'Revision already loaded.' );
		}

		await restoreButton.click();

		// If the spec is using RevisionsPage, this implies the
		// account is using WP-Admin.
		await this.page.waitForURL( /wp-admin\/post.php/, { timeout: 20 * 1000 } );
	}
}
