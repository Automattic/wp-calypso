import config from 'config';
import { By } from 'selenium-webdriver';
import FindADomainComponent from '../components/find-a-domain-component';
import * as driverHelper from '../driver-helper';
import MyHomePage from '../pages/my-home-page';
import PickAPlanPage from '../pages/signup/pick-a-plan-page';
import StartPage from '../pages/signup/start-page.js';

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

		const hoorayScreenLocator = By.css( '.reskinned-processing-screen' );

		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, hoorayScreenLocator );
		/**
		 * Let's give the create request enough time to finish. Sometimes it takes
		 * way more than the default 20 seconds, and the cost of waiting a bit
		 * longer is definitely lower than the cost of repeating the whole spec.
		 */
		await driverHelper.waitUntilElementNotLocated(
			this.driver,
			hoorayScreenLocator,
			config.get( 'explicitWaitMS' ) * 3
		);

		const myHomePage = await MyHomePage.Expect( this.driver );
		return await myHomePage.siteSetupListExists();
	}
}
