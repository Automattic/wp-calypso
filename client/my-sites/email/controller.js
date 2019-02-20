/** @format */

/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal Dependencies
 */
import * as domainsPaths from 'my-sites/domains/paths';

export default {
	emailManagementAddGSuiteUsersRedirect( pageContext ) {
		page.redirect(
			domainsPaths.domainManagementAddGSuiteUsers(
				pageContext.params.site,
				pageContext.params.domain
			)
		);
	},

	emailManagementForwardingRedirect( pageContext ) {
		page.redirect(
			domainsPaths.domainManagementEmailForwarding(
				pageContext.params.site,
				pageContext.params.domain
			)
		);
	},

	emailManagementRedirect( pageContext ) {
		page.redirect(
			domainsPaths.domainManagementEmail( pageContext.params.site, pageContext.params.domain )
		);
	},
};
