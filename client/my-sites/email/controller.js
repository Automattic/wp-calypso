/** @format */

/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import { get, includes, map } from 'lodash';

/**
 * Internal Dependencies
 */
import Email from './email';
import EmailForwarding from './email-forwarding';
import DomainManagementData from 'components/data/domain-management';
import { emailManagement, emailManagementForwarding } from './paths';
import GSuiteAddUsers from 'my-sites/domains/domain-management/gsuite/gsuite-add-users';
import { getSelectedSiteId } from 'state/ui/selectors';
import getSites from 'state/selectors/get-sites';
import { getCurrentUser } from 'state/current-user/selectors';

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

	redirectIfNoSite( redirectTo ) {
		return ( context, next ) => {
			const state = context.store.getState();
			const siteId = getSelectedSiteId( state );
			const sites = getSites( state );
			const siteIds = map( sites, 'ID' );

			if ( ! includes( siteIds, siteId ) ) {
				const user = getCurrentUser( state );
				const visibleSiteCount = get( user, 'visible_site_count', 0 );
				//if only one site navigate to stats to avoid redirect loop
				const redirect = visibleSiteCount > 1 ? redirectTo : '/stats';
				return page.redirect( redirect );
			}
			next();
		};
	},
};
