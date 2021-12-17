import LoggedOutMasterbarComponent from '../components/logged-out-masterbar-component.js';
import AccountSettingsPage from '../pages/account/account-settings-page.js';
import CloseAccountPage from '../pages/account/close-account-page.js';
import * as SlackNotifier from '../slack-notifier.js';

export default class DeleteAccountFlow {
	constructor( driver ) {
		this.driver = driver;
	}
	async deleteAccount( name ) {
		await this.driver.sleep( 2000 ); // wait before open account settings page

		return ( async () => {
			const accountSettingsPage = await AccountSettingsPage.Visit( this.driver );
			await accountSettingsPage.chooseCloseYourAccount();
			const closeAccountPage = await CloseAccountPage.Expect( this.driver );
			await closeAccountPage.chooseCloseAccount();
			await closeAccountPage.enterAccountNameAndClose( name );
			await closeAccountPage.confirmAccountHasBeenClosed();
			return await LoggedOutMasterbarComponent.Expect( this.driver );
		} )().catch( ( err ) => {
			SlackNotifier.warn(
				`There was an error in the hooks that delete test account, but since it is cleaning up we really don't care: '${ err }'`,
				{ suppressDuplicateMessages: true }
			);
		} );
	}
}
