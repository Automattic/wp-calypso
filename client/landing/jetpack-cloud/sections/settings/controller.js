/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import SettingsPage from './main';
import SettingsFlow from './settings-flow';

export function settings( context, next ) {
	context.primary = isEnabled( 'jetpack/server-credentials-advanced-flow' ) ? (
		<SettingsFlow />
	) : (
		<SettingsPage />
	);
	next();
}
