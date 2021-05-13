/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import HasSitePurchasesSwitch from 'calypso/components/has-site-purchases-switch';
import IsCurrentUserAdminSwitch from 'calypso/components/jetpack/is-current-user-admin-switch';
import NotAuthorizedPage from 'calypso/components/jetpack/not-authorized-page';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import AdvancedCredentials from './advanced-credentials';
import NoSitesPurchasesMessage from './empty-content';
import HasSiteCredentialsSwitch from './has-site-credentials-switch';
import AdvancedCredentialsLoadingPlaceholder from './loading';
import SettingsPage from './main';

export const settings: PageJS.Callback = ( context, next ) => {
	context.primary = <SettingsPage />;
	next();
};

export const advancedCredentials: PageJS.Callback = ( context, next ) => {
	const { host, action } = context.query;
	const siteId = getSelectedSiteId( context.store.getState() ) as number;
	const sectionElt = <AdvancedCredentials action={ action } host={ host } role="main" />;

	context.primary = (
		<HasSiteCredentialsSwitch
			siteId={ siteId }
			trueComponent={ sectionElt }
			falseComponent={
				<HasSitePurchasesSwitch
					siteId={ siteId }
					trueComponent={ sectionElt }
					falseComponent={ <NoSitesPurchasesMessage /> }
					loadingComponent={ <AdvancedCredentialsLoadingPlaceholder /> }
				/>
			}
			loadingComponent={ <AdvancedCredentialsLoadingPlaceholder /> }
		/>
	);

	next();
};

export const showNotAuthorizedForNonAdmins: PageJS.Callback = ( context, next ) => {
	context.primary = (
		<IsCurrentUserAdminSwitch
			trueComponent={ context.primary }
			falseComponent={ <NotAuthorizedPage /> }
		/>
	);

	next();
};
