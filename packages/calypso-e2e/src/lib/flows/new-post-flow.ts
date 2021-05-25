/**
 * Internal dependencies
 */
import { NavbarComponent } from '../components';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

export class NewPostFlow {
	page: Page;

	constructor( page: Page ) {
		this.page = page;
	}

	async createPostFromNavbar() {
		const navbar = new NavbarComponent( this.page );
		await navbar.clickNewPost();
	}
}
