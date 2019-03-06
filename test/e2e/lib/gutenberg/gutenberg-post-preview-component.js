/** @format */
import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import ViewPostPage from '../pages/view-post-page';
import * as driverHelper from '../driver-helper';

export default class GutenbergPostPreviewComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#main.site-main' ) );
	}

	async _preInit() {
		await driverHelper.waitForNumberOfWindows( this.driver, 2 );
		return await driverHelper.switchToWindowByIndex( this.driver, 1 );
	}

	async close() {
		await driverHelper.closeCurrentWindow( this.driver );
		return await driverHelper.switchToWindowByIndex( this.driver, 0 );
	}

	async postTitle() {
		const viewPostPage = await ViewPostPage.Expect( this.driver );
		return await viewPostPage.postTitle();
	}

	async postContent() {
		const viewPostPage = await ViewPostPage.Expect( this.driver );
		return await viewPostPage.postContent();
	}

	async categoryDisplayed() {
		const viewPostPage = await ViewPostPage.Expect( this.driver );
		return await viewPostPage.categoryDisplayed();
	}

	async tagDisplayed() {
		const viewPostPage = await ViewPostPage.Expect( this.driver );
		return await viewPostPage.tagDisplayed();
	}

	async imageDisplayed( fileDetails ) {
		const viewPagePage = await ViewPostPage.Expect( this.driver );
		return await viewPagePage.imageDisplayed( fileDetails );
	}

	async ensureContactFormDisplayedInPost() {
		const viewPostPage = await ViewPostPage.Expect( this.driver );
		return await viewPostPage.contactFormDisplayed();
	}
}
