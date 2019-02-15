/** @format */

/**
 * External dependencies
 */
import { includes } from 'lodash';
import page from 'page';
import React from 'react';

/**
 * Internal Dependencies
 */
import Email from './email';
import EmailForwarding from './emailForwarding';
import DomainManagementData from 'components/data/domain-management';
import { emailManagement, emailManagementForwarding } from './paths';
import GSuiteAddUsers from './gsuite/gsuite-add-users';

export default {
	emailManagementAddGSuiteUsers( pageContext, next ) {
		pageContext.primary = <GSuiteAddUsers selectedDomainName={ pageContext.params.domain } />;
		next();
	},

	emailManagementForwarding( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ emailManagementForwarding( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Email Forwarding"
				component={ EmailForwarding }
				context={ pageContext }
				needsEmailForwarding
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	emailManagement( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ emailManagement(
					':site',
					pageContext.params.domain ? ':domain' : undefined
				) }
				analyticsTitle="Domain Management > Email"
				component={ Email }
				context={ pageContext }
				needsCart
				needsDomains
				needsGoogleApps
				needsPlans
				needsProductsList
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},
};
