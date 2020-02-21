/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackCloudSettingsPage from './main';

export function jetpackCloudSettings( context, next ) {
	context.primary = <JetpackCloudSettingsPage />;
	next();
}