/**
 * Internal dependencies
 */
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

		const myHomePage = await MyHomePage.Expect( this.driver );
		return await myHomePage.siteSetupListExists();
	}
}
