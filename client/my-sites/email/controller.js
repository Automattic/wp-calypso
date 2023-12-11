import page from '@automattic/calypso-router';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import AddMailboxes from 'calypso/my-sites/email/add-mailboxes';
import EmailForwardsAdd from 'calypso/my-sites/email/email-forwards-add';
import EmailHome from 'calypso/my-sites/email/email-management/email-home';
import TitanControlPanelRedirect from 'calypso/my-sites/email/email-management/titan-control-panel-redirect';
import TitanManageMailboxes from 'calypso/my-sites/email/email-management/titan-manage-mailboxes';
import TitanManagementIframe from 'calypso/my-sites/email/email-management/titan-management-iframe';
import EmailProvidersInDepthComparison from 'calypso/my-sites/email/email-providers-comparison/in-depth';
import { castIntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import EmailProvidersStackedComparison from 'calypso/my-sites/email/email-providers-comparison/stacked';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import MailboxesManagement from 'calypso/my-sites/email/mailboxes';
import * as paths from 'calypso/my-sites/email/paths';
import TitanSetUpMailbox from 'calypso/my-sites/email/titan-set-up-mailbox';
import TitanSetUpThankYou from 'calypso/my-sites/email/titan-set-up-thank-you';

export default {
	emailManagementAddEmailForwards( pageContext, next ) {
		pageContext.primary = (
			<CalypsoShoppingCartProvider>
				<PageViewTracker
					path={ paths.emailManagementAddEmailForwards( ':site', ':domain' ) }
					title="Email Management > Add Email Forwards"
				/>

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
				<PageViewTracker
					path={ paths.emailManagementAddGSuiteUsers( ':site', ':domain', ':productType' ) }
					title="Email Management > Add Google Users"
				/>

				<AddMailboxes
					provider={ EmailProvider.Google }
					selectedDomainName={ pageContext.params.domain }
					source={ pageContext.query.source }
				/>
			</CalypsoShoppingCartProvider>
		);

		next();
	},

	emailManagementManageTitanAccount( pageContext, next ) {
		pageContext.primary = (
			<>
				<PageViewTracker
					path={ paths.emailManagementManageTitanAccount( ':site', ':domain' ) }
					title="Email Management > Titan > Manage Account"
				/>

				<TitanManagementIframe
					context={ pageContext.query.context }
					domainName={ pageContext.params.domain }
				/>
			</>
		);

		next();
	},

	emailManagementManageTitanMailboxes( pageContext, next ) {
		pageContext.primary = (
			<CalypsoShoppingCartProvider>
				<PageViewTracker
					path={ paths.emailManagementManageTitanMailboxes( ':site', ':domain' ) }
					title="Email Management > Titan > Manage All Mailboxes"
				/>

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
				<PageViewTracker
					path={ paths.emailManagementNewTitanAccount( ':site', ':domain' ) }
					title="Email Management > Add Titan Mailboxes"
				/>

				<AddMailboxes
					provider={ EmailProvider.Titan }
					selectedDomainName={ pageContext.params.domain }
					source={ pageContext.query.source }
				/>
			</CalypsoShoppingCartProvider>
		);

		next();
	},

	emailManagementTitanSetUpMailbox( pageContext, next ) {
		pageContext.primary = (
			<CalypsoShoppingCartProvider>
				<PageViewTracker
					path={ paths.emailManagementTitanSetUpMailbox( ':site', ':domain' ) }
					title="Email Management > Set Up Titan Mailbox"
				/>

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
				<PageViewTracker
					path={ paths.emailManagementPurchaseNewEmailAccount( ':site', ':domain' ) }
					title="Email Comparison"
					properties={ {
						source: pageContext.query.source,
						context: 'email-purchase',
						provider: pageContext.query.provider,
					} }
				/>

				<EmailProvidersStackedComparison
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
				<PageViewTracker
					path={ paths.emailManagementInDepthComparison(
						':site',
						':domain',
						null,
						pageContext.query.source
					) }
					title="Email Comparison > In-Depth Comparison"
				/>

				<EmailProvidersInDepthComparison
					referrer={ pageContext.query.referrer }
					selectedDomainName={ pageContext.params.domain }
					selectedIntervalLength={ castIntervalLength( pageContext.query.interval ) }
					source={ pageContext.query.source }
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
			<>
				<PageViewTracker
					path={ paths.emailManagementTitanSetUpThankYou( ':site', ':domain' ) }
					title="Checkout > Purchased Titan mailbox"
				/>

				<TitanSetUpThankYou
					containerClassName="titan-set-up-thank-you__container_wrapped"
					domainName={ pageContext.params.domain }
					emailAddress={ pageContext.query.email }
				/>
			</>
		);

		next();
	},

	emailManagementForwardingRedirect( pageContext ) {
		page.redirect( paths.emailManagement( pageContext.params.site, pageContext.params.domain ) );
	},

	emailManagement( pageContext, next ) {
		pageContext.primary = (
			<CalypsoShoppingCartProvider>
				<PageViewTracker
					path={ paths.emailManagement( ':site', pageContext.params.domain ? ':domain' : null ) }
					title="Email Home"
					properties={ { source: pageContext.query.source } }
				/>

				<EmailHome
					source={ pageContext.query.source }
					selectedDomainName={ pageContext.params.domain }
					selectedEmailProviderSlug={ pageContext.query.provider }
					selectedIntervalLength={ castIntervalLength( pageContext.query.interval ) }
				/>
			</CalypsoShoppingCartProvider>
		);

		next();
	},

	emailManagementMailboxes( pageContext, next ) {
		pageContext.primary = (
			// Defer PageViewTracker to `MailboxesManagement` component, since we track different page
			// view contexts depending on a few parameters
			<MailboxesManagement
				selectedIntervalLength={ castIntervalLength( pageContext.query.interval ) }
			/>
		);

		next();
	},
};
