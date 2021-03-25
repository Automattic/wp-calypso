/**
 * External dependencies
 */
import React from 'react';
import { isEnabled } from '@automattic/calypso-config';

/**
 * Internal Dependencies
 */
import EmailForwarding from 'calypso/my-sites/email/email-forwarding';
import EmailManagement from 'calypso/my-sites/email/email-management';
import GSuiteAddUsers from 'calypso/my-sites/email/gsuite-add-users';
import TitanMailAddMailboxes from 'calypso/my-sites/email/titan-mail-add-mailboxes';
import TitanMailQuantitySelection from 'calypso/my-sites/email/titan-mail-quantity-selection';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import TitanControlPanelRedirect from 'calypso/my-sites/email/email-management/titan-control-panel-redirect';
import TitanManagementIframe from 'calypso/my-sites/email/email-management/titan-management-iframe';
import EmailManagementHome from 'calypso/my-sites/email/email-management/email-home';

export default {
	emailManagementAddGSuiteUsers( pageContext, next ) {
		pageContext.primary = (
			<CalypsoShoppingCartProvider>
				<GSuiteAddUsers
					productType={ pageContext.params.productType }
					selectedDomainName={ pageContext.params.domain }
				/>
			</CalypsoShoppingCartProvider>
		);

		next();
	},

	emailManagementNewGSuiteAccount( pageContext, next ) {
		pageContext.primary = (
			<CalypsoShoppingCartProvider>
				<GSuiteAddUsers
					isNewAccount
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
				domainName={ pageContext.params.domain }
				context={ pageContext.query.context }
			/>
		);

		next();
	},

	emailManagementNewTitanAccount( pageContext, next ) {
		pageContext.primary = (
			<CalypsoShoppingCartProvider>
				{ isEnabled( 'titan/provision-mailboxes' ) ? (
					<TitanMailAddMailboxes selectedDomainName={ pageContext.params.domain } />
				) : (
					<TitanMailQuantitySelection selectedDomainName={ pageContext.params.domain } />
				) }
			</CalypsoShoppingCartProvider>
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
		if ( isEnabled( 'email/centralized-home' ) ) {
			pageContext.primary = (
				<CalypsoShoppingCartProvider>
					<EmailManagementHome selectedDomainName={ pageContext.params.domain } />
				</CalypsoShoppingCartProvider>
			);
		} else {
			pageContext.primary = <EmailManagement selectedDomainName={ pageContext.params.domain } />;
		}

		next();
	},
};
