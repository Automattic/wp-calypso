/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackCloudBackupDownloadPage from './main';

export function jetpackCloudBackupDownload( context, next ) {
	const downloadId = parseInt( context.params.downloadId );

	context.primary = <JetpackCloudBackupDownloadPage downloadId={ downloadId } />
	
	next();
}