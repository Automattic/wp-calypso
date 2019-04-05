/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import EmailForwarding from 'my-sites/email/email-forwarding';
import EmailManagement from 'my-sites/email/email-management';
import GSuiteAddUsers from 'my-sites/email/gsuite-add-users';

export default {
	emailManagementAddGSuiteUsers( pageContext, next ) {
		pageContext.primary = <GSuiteAddUsers selectedDomainName={ pageContext.params.domain } />;
		next();
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
