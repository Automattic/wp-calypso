/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import IsCurrentUserAdminSwitch from 'calypso/components/jetpack/is-current-user-admin-switch';
import NotAuthorizedPage from 'calypso/components/jetpack/not-authorized-page';
import AdvancedCredentials from './advanced-credentials';
import SettingsPage from './main';

export const settings: PageJS.Callback = ( context, next ) => {
	context.primary = <SettingsPage />;
	next();
};

export const advancedCredentials: PageJS.Callback = ( context, next ) => {
	const { host, action } = context.query;
	context.primary = <AdvancedCredentials action={ action } host={ host } role="main" />;
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
