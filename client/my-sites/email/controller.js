/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import EmailForwarding from 'calypso/my-sites/email/email-forwarding';
import EmailManagementHome from 'calypso/my-sites/email/email-management/email-home';
import EmailProvidersComparison from 'calypso/my-sites/email/email-providers-comparison';
import GSuiteAddUsers from 'calypso/my-sites/email/gsuite-add-users';
import TitanAddMailboxes from 'calypso/my-sites/email/titan-add-mailboxes';
import TitanControlPanelRedirect from 'calypso/my-sites/email/email-management/titan-control-panel-redirect';
import TitanManageMailboxes from 'calypso/my-sites/email/email-management/titan-manage-mailboxes';
import TitanManagementIframe from 'calypso/my-sites/email/email-management/titan-management-iframe';

export default {
	emailManagementAddGSuiteUsers( pageContext, next ) {
		pageContext.primary = (
			<GSuiteAddUsers
				productType={ pageContext.params.productType }
				selectedDomainName={ pageContext.params.domain }
			/>
		);

		next();
	},

	emailManagementManageTitanAccount( pageContext, next ) {
		pageContext.primary = (
			<TitanManagementIframe
				domainName={ pageContext.params.domain }
				context={ pageContext.query.context }
			/>
		);

		next();
	},

	emailManagementManageTitanMailboxes( pageContext, next ) {
		pageContext.primary = (
			<TitanManageMailboxes
				context={ pageContext.query.context }
				selectedDomainName={ pageContext.params.domain }
			/>
		);

		next();
	},

	emailManagementNewTitanAccount( pageContext, next ) {
		pageContext.primary = <TitanAddMailboxes selectedDomainName={ pageContext.params.domain } />;

		next();
	},

	emailManagementPurchaseNewEmailAccount( pageContext, next ) {
		pageContext.primary = (
			<EmailProvidersComparison selectedDomainName={ pageContext.params.domain } />
		);

		next();
	},

	emailManagementTitanControlPanelRedirect( pageContext, next ) {
		pageContext.primary = (
			<TitanControlPanelRedirect
				domainName={ pageContext.params.domain }
				siteSlug={ pageContext.params.site }
				context={ pageContext.query.context }
			/>
		);

		next();
	},

	emailManagementForwarding( pageContext, next ) {
		pageContext.primary = <EmailForwarding selectedDomainName={ pageContext.params.domain } />;

		next();
	},

	emailManagement( pageContext, next ) {
		pageContext.primary = <EmailManagementHome selectedDomainName={ pageContext.params.domain } />;

		next();
	},
};
