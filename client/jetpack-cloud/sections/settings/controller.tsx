/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
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
