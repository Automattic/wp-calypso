/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackCloudBackupsPage from './main';

export function jetpackCloudBackups( context, next ) {
	context.primary = <JetpackCloudBackupsPage />;
	next();
}