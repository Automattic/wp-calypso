/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackCloudBackupRestorePage from './main';

export function jetpackCloudBackupRestore( context, next ) {
	const restoreId = parseInt( context.params.restoreId );

	context.primary = (
		<JetpackCloudBackupRestorePage
			restoreId={
				context.params.restoreId
					? parseInt( context.params.restoreId )
					: null
			}
		/>
	);
	
	next();
}