/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackCloudBackupDetailPage from './main';

export function jetpackCloudBackupDetail( context, next ) {
	const backupId = parseInt( context.params.backupId );

	context.primary = <JetpackCloudBackupDetailPage backupId={ backupId } />
	
	next();
}