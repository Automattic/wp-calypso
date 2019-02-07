/** @format */
import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import ViewPagePage from '../pages/view-page-page';

export default class GutenbergPagePreviewComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#main.site-main' ) );
	}

	async pageTitle() {
		const viewPagePage = await ViewPagePage.Expect( this.driver );
		return await viewPagePage.pageTitle();
	}

	async pageContent() {
		const viewPagePage = await ViewPagePage.Expect( this.driver );
		return await viewPagePage.pageContent();
	}

	async imageDisplayed( fileDetails ) {
		const viewPagePage = await ViewPagePage.Expect( this.driver );
		return await viewPagePage.imageDisplayed( fileDetails );
	}
}
