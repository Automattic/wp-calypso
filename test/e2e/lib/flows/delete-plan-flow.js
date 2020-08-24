/**
 * Internal dependencies
 */
import ManagePurchasePage from '../pages/manage-purchase-page';
import CancelPurchasePage from '../pages/cancel-purchase-page';
import * as SlackNotifier from '../slack-notifier';
import NavBarComponent from '../components/nav-bar-component';
import NoticesComponent from '../components/notices-component';
import ProfilePage from '../pages/profile-page';
import PurchasesPage from '../pages/purchases-page';

export default class DeletePlanFlow {
	constructor( driver ) {
		this.driver = driver;
	}
	deletePlan( planName, { deleteDomainAlso = false } = {} ) {
		return ( async () => {
			const navBarComponent = await NavBarComponent.Expect( this.driver );
			await navBarComponent.clickProfileLink();
			const profilePage = await ProfilePage.Expect( this.driver );
			await profilePage.chooseManagePurchases();
			const purchasesPage = await PurchasesPage.Expect( this.driver );
			await purchasesPage.dismissGuidedTour();

			if ( planName === 'business' ) {
				await purchasesPage.selectBusinessPlan();
			} else if ( planName === 'premium' ) {
				await purchasesPage.selectPremiumPlan();
			} else if ( planName === 'personal' ) {
				await purchasesPage.selectPersonalPlan();
			} else if ( planName === 'theme' ) {
				await purchasesPage.selectTheme();
			}

			const managePurchasePage = await ManagePurchasePage.Expect( this.driver );
			await managePurchasePage.chooseCancelAndRefund();
			const cancelPurchasePage = await CancelPurchasePage.Expect( this.driver );
			if ( deleteDomainAlso ) {
				await cancelPurchasePage.chooseCancelPlanAndDomain();
			}
			await cancelPurchasePage.clickCancelPurchase();

			if ( planName === 'theme' ) {
				await cancelPurchasePage.completeThemeCancellation();
			} else {
				await cancelPurchasePage.completeCancellationSurvey();
			}

			const noticesComponent = await NoticesComponent.Expect( this.driver );
			return await noticesComponent.dismissNotice();
		} )().catch( ( err ) => {
			SlackNotifier.warn(
				`There was an error in the hooks that clean up the test account (delete plan) but since it is cleaning up we really don't care: '${ err }'`,
				{ suppressDuplicateMessages: true }
			);
		} );
	}
}
