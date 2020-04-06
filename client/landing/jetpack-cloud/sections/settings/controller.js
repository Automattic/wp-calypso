/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SettingsPage from './main';

export function settings( context, next ) {
	context.primary = <SettingsPage />;
	next();
}
