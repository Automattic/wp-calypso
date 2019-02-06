/** @format */
import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import ViewPagePage from '../pages/view-page-page';
import * as driverHelper from '../driver-helper';

export default class GutenbergPagePreviewComponent extends AsyncBaseContainer {
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
