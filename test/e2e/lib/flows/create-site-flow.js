/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper';
import FindADomainComponent from '../components/find-a-domain-component';
import PickAPlanPage from '../pages/signup/pick-a-plan-page';
import StartPage from '../pages/signup/start-page.js';
import MyHomePage from '../pages/my-home-page';

export default class CreateSiteFlow {
	constructor( driver, blogName ) {
		this.driver = driver;
		this.blogName = blogName;
	}
	async createFreeSite() {
		await StartPage.Visit( this.driver, StartPage.getStartURL() );

		const findADomainComponent = await FindADomainComponent.Expect( this.driver );
		await findADomainComponent.searchForBlogNameAndWaitForResults( this.blogName );
		await findADomainComponent.selectFreeAddress();

		const pickAPlanPage = await PickAPlanPage.Expect( this.driver );
		await pickAPlanPage.selectFreePlan();

		// Let's give the create request enough time to finish. Sometimes it takes
		// way more than the default 20 seconds, and the cost of waiting a bit
		// longer is definitely lower than the cost of repeating the whole spec.
		const hoorayTitleLocator = By.css( '.signup-processing-screen__title' );
		await driverHelper.waitUntilElementWithTextLocated(
			this.driver,
			hoorayTitleLocator,
			/your site will be ready shortly/i
		);
		await driverHelper.waitUntilNotLocated( this.driver, hoorayTitleLocator, 60000 );

		const myHomePage = await MyHomePage.Expect( this.driver );
		return await myHomePage.siteSetupListExists();
	}
}
