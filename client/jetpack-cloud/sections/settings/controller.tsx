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
	const { host } = context.query;
	context.primary = <AdvancedCredentials host={ host } />;
	next();
};
