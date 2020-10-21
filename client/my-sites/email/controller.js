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

export default {
	emailManagementAddGSuiteUsers( pageContext, next ) {
		pageContext.primary = <GSuiteAddUsers selectedDomainName={ pageContext.params.domain } />;
		next();
	},

	emailManagementAddGSuiteUsersLegacyRedirect( pageContext ) {
		page.redirect(
			emailManagementAddGSuiteUsers( pageContext.params.site, pageContext.params.domain )
		);
	},

	emailManagementNewGSuiteAccount( pageContext, next ) {
		pageContext.primary = (
			<GSuiteAddUsers
				planType={ pageContext.params.planType }
				selectedDomainName={ pageContext.params.domain }
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
