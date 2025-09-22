import { __, sprintf } from '@wordpress/i18n';
import { formatDate } from '../../utils/datetime';
import type { DeploymentRunStatus } from '@automattic/api-core';

export const getDeploymentTimeTooltipText = (
	locale: string,
	completedOn: string,
	createdOn: string,
	status: DeploymentRunStatus
): string => {
	const formatDateTime = ( timestamp: string ) => {
		return formatDate( new Date( timestamp ), locale, { dateStyle: 'medium', timeStyle: 'long' } );
	};

	switch ( status ) {
		case 'pending':
		case 'queued':
			return sprintf(
				/* translators: %s is the date and time the deployment was queued. e.g. Queued on Sep 19, 2025, 5:11:17 PM */
				__( 'Queued on %s' ),
				formatDateTime( createdOn )
			);
		case 'running':
		case 'building':
		case 'failed':
		case 'warnings':
			return sprintf(
				/* translators: %s is the date and time the deployment started. e.g. Started on Sep 19, 2025, 5:11:17 PM */
				__( 'Started on %s' ),
				formatDateTime( createdOn )
			);
		case 'success':
			return sprintf(
				/* translators: %s is the date and time the deployment finished. e.g. Finished on Sep 19, 2025, 5:11:17 PM */
				__( 'Finished on %s' ),
				formatDateTime( completedOn )
			);
		default:
			return formatDateTime( createdOn );
	}
};
