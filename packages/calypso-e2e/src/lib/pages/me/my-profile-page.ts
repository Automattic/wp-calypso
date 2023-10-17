import { Page } from 'playwright';
import { getCalypsoURL } from '../../../data-helper';

/**
 * Represents the /me endpoint.
 */
export class MyProfilePage {
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
	 * Visits the /me endpoint.
	 */
	async visit() {
		await this.page.goto( getCalypsoURL( 'me' ) );
	}
}
