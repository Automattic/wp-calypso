import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import EmailForwarding from 'calypso/my-sites/email/email-forwarding';
import EmailForwardsAdd from 'calypso/my-sites/email/email-forwards-add';
import EmailManagementHome from 'calypso/my-sites/email/email-management/email-home';
import TitanControlPanelRedirect from 'calypso/my-sites/email/email-management/titan-control-panel-redirect';
import TitanManageMailboxes from 'calypso/my-sites/email/email-management/titan-manage-mailboxes';
import TitanManagementIframe from 'calypso/my-sites/email/email-management/titan-management-iframe';
import EmailProvidersInDepthComparison from 'calypso/my-sites/email/email-providers-comparison/in-depth';
import { castIntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import EmailProvidersStackedComparisonPage from 'calypso/my-sites/email/email-providers-stacked-comparison/page';
import GSuiteAddUsers from 'calypso/my-sites/email/gsuite-add-users';
import InboxManagement from 'calypso/my-sites/email/inbox';
import TitanAddMailboxes from 'calypso/my-sites/email/titan-add-mailboxes';
import TitanSetUpMailbox from 'calypso/my-sites/email/titan-set-up-mailbox';
import TitanSetUpThankYou from 'calypso/my-sites/email/titan-set-up-thank-you';

export default {
	emailManagementAddEmailForwards( pageContext, next ) {
		pageContext.primary = (
			<CalypsoShoppingCartProvider>
				<EmailForwardsAdd
					selectedDomainName={ pageContext.params.domain }
					source={ pageContext.query.source }
				/>
			</CalypsoShoppingCartProvider>
		);

		next();
	},

	emailManagementAddGSuiteUsers( pageContext, next ) {
		pageContext.primary = (
			<CalypsoShoppingCartProvider>
				<GSuiteAddUsers
					source={ pageContext.query.source }
					productType={ pageContext.params.productType }
					selectedDomainName={ pageContext.params.domain }
				/>
			</CalypsoShoppingCartProvider>
		);

		next();
	},

	emailManagementManageTitanAccount( pageContext, next ) {
		pageContext.primary = (
			<TitanManagementIframe
				context={ pageContext.query.context }
				domainName={ pageContext.params.domain }
			/>
		);

		next();
	},

	emailManagementManageTitanMailboxes( pageContext, next ) {
		pageContext.primary = (
			<CalypsoShoppingCartProvider>
				<TitanManageMailboxes
					context={ pageContext.query.context }
					selectedDomainName={ pageContext.params.domain }
				/>
			</CalypsoShoppingCartProvider>
		);

		next();
	},

	emailManagementNewTitanAccount( pageContext, next ) {
		pageContext.primary = (
			<CalypsoShoppingCartProvider>
				<TitanAddMailboxes
					source={ pageContext.query.source }
					selectedDomainName={ pageContext.params.domain }
				/>
			</CalypsoShoppingCartProvider>
		);

		next();
	},

	emailManagementTitanSetUpMailbox( pageContext, next ) {
		pageContext.primary = (
			<CalypsoShoppingCartProvider>
				<TitanSetUpMailbox
					source={ pageContext.query.source }
					selectedDomainName={ pageContext.params.domain }
				/>
			</CalypsoShoppingCartProvider>
		);

		next();
	},

	emailManagementPurchaseNewEmailAccount( pageContext, next ) {
		pageContext.primary = (
			<CalypsoShoppingCartProvider>
				<EmailProvidersStackedComparisonPage
					comparisonContext="email-purchase"
					selectedDomainName={ pageContext.params.domain }
					selectedEmailProviderSlug={ pageContext.query.provider }
					selectedIntervalLength={ castIntervalLength( pageContext.query.interval ) }
					source={ pageContext.query.source }
				/>
			</CalypsoShoppingCartProvider>
		);

		next();
	},

	emailManagementInDepthComparison( pageContext, next ) {
		pageContext.primary = (
			<CalypsoShoppingCartProvider>
				<EmailProvidersInDepthComparison
					selectedDomainName={ pageContext.params.domain }
					selectedIntervalLength={ castIntervalLength( pageContext.query.interval ) }
				/>
			</CalypsoShoppingCartProvider>
		);

		next();
	},

	emailManagementTitanControlPanelRedirect( pageContext, next ) {
		pageContext.primary = (
			<TitanControlPanelRedirect
				context={ pageContext.query.context }
				domainName={ pageContext.params.domain }
				siteSlug={ pageContext.params.site }
			/>
		);

		next();
	},

	emailManagementTitanSetUpThankYou( pageContext, next ) {
		pageContext.primary = (
			<TitanSetUpThankYou
				domainName={ pageContext.params.domain }
				emailAddress={ pageContext.query.email }
			/>
		);

		next();
	},

	emailManagementForwarding( pageContext, next ) {
		pageContext.primary = <EmailForwarding selectedDomainName={ pageContext.params.domain } />;

		next();
	},

	emailManagement( pageContext, next ) {
		pageContext.primary = (
			<CalypsoShoppingCartProvider>
				<EmailManagementHome
					source={ pageContext.query.source }
					selectedDomainName={ pageContext.params.domain }
				/>
			</CalypsoShoppingCartProvider>
		);

		next();
	},

	emailManagementInbox( pageContext, next ) {
		pageContext.primary = <InboxManagement />;
		next();
	},
};
