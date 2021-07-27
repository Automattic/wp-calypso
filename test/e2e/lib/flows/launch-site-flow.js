import FindADomainComponent from '../components/find-a-domain-component';
import MyHomePage from '../pages/my-home-page';
import PickAPlanPage from '../pages/signup/pick-a-plan-page';

export default class LaunchSiteFlow {
	constructor( driver ) {
		this.driver = driver;
	}
	async launchFreeSite() {
		const myHomePage = await MyHomePage.Expect( this.driver );
		await myHomePage.launchSiteFromSiteSetup();

		const findADomainComponent = await FindADomainComponent.Expect( this.driver );
		await findADomainComponent.skipSuggestion();

		const pickAPlanPage = await PickAPlanPage.Expect( this.driver );
		await pickAPlanPage.selectFreePlan();

		return await myHomePage.waitForSiteLaunchComplete();
	}
}
