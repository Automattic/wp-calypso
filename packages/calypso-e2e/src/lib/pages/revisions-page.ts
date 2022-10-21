import { Page } from 'playwright';
import { ElementHelper } from '../..';

/**
 * Represents the Revision page.
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
	 * @param index Revision number (1-based)
	 */
	async selectRevision( index: number ): Promise< void > {
		const sliderTickmarks = this.page.locator( '.revisions-tickmarks > div' );
		const revisionCount = ( await sliderTickmarks.count() ) + 1;

		if ( index > revisionCount ) {
			throw new Error(
				`Incorrect revision number (${ index }). Available revisions: 1 - ${ revisionCount }`
			);
		}

		const slider = this.page.locator( '.revisions-controls > .wp-slider' );
		const sliderWidth = ( await slider.boundingBox() )?.width as number;
		const clickPositionX = ( sliderWidth * ( index - 1 ) ) / ( revisionCount - 1 );

		await Promise.all( [
			ElementHelper.waitForMutations( this.page, '.revisions-diff-frame' ),
			slider.click( { position: { x: clickPositionX, y: 1 } } ),
		] );
	}

	/**
	 * Clicks the "Restore This Revision" button. Throws if the current revision
	 * is already loaded.
	 */
	async loadSelectedRevision() {
		const restoreButton = this.page.locator( 'input[value="Restore This Revision"]' );
		if ( await restoreButton.isDisabled() ) {
			throw new Error( 'Revision already loaded' );
		}

		await Promise.all( [
			this.page.waitForNavigation( { waitUntil: 'networkidle' } ),
			restoreButton.click(),
		] );
	}
}
