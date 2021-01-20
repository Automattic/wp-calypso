/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import EmailForwarding from 'calypso/my-sites/email/email-forwarding';
import EmailManagement from 'calypso/my-sites/email/email-management';
import { emailManagementAddGSuiteUsers } from 'calypso/my-sites/email/paths';
import GSuiteAddUsers from 'calypso/my-sites/email/gsuite-add-users';
import TitanMailQuantitySelection from 'calypso/my-sites/email/titan-mail-quantity-selection';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import TitanControlPanelRedirect from 'calypso/my-sites/email/email-management/titan-control-panel-redirect';
import TitanManagementIframe from 'calypso/my-sites/email/email-management/titan-management-iframe';

export default {
	emailManagementAddGSuiteUsers( pageContext, next ) {
		pageContext.primary = (
			<CalypsoShoppingCartProvider>
				<GSuiteAddUsers selectedDomainName={ pageContext.params.domain } />
			</CalypsoShoppingCartProvider>
		);

		next();
	},

	emailManagementAddGSuiteUsersLegacyRedirect( pageContext ) {
		page.redirect(
			emailManagementAddGSuiteUsers( pageContext.params.site, pageContext.params.domain )
		);
	},

	emailManagementNewGSuiteAccount( pageContext, next ) {
		pageContext.primary = (
			<CalypsoShoppingCartProvider>
				<GSuiteAddUsers
					planType={ pageContext.params.planType }
					selectedDomainName={ pageContext.params.domain }
				/>
			</CalypsoShoppingCartProvider>
		);

		next();
	},

	emailManagementManageTitanAccount( pageContext, next ) {
		pageContext.primary = <TitanManagementIframe domainName={ pageContext.params.domain } />;

		next();
	},

	emailManagementNewTitanAccount( pageContext, next ) {
		pageContext.primary = (
			<CalypsoShoppingCartProvider>
				<TitanMailQuantitySelection selectedDomainName={ pageContext.params.domain } />
			</CalypsoShoppingCartProvider>
		);

		next();
	},

	emailManageMentTitanControlPanelRedirect( pageContext, next ) {
		pageContext.primary = (
			<TitanControlPanelRedirect
				domainName={ pageContext.params.domain }
				siteSlug={ pageContext.params.site }
			/>
		);

		next();
	},

	emailManagementForwarding( pageContext, next ) {
		pageContext.primary = <EmailForwarding selectedDomainName={ pageContext.params.domain } />;

		next();
	},

	emailManagement( pageContext, next ) {
		pageContext.primary = <EmailManagement selectedDomainName={ pageContext.params.domain } />;

		next();
	},
};
