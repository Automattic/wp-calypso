import { isDashboardBackport } from './is-dashboard-backport';
import { isSelfHostedJetpackConnected } from './site-types';
import type { Site } from '@automattic/api-core';

export function getBackupUrl( site: Site ) {
	if ( isSelfHostedJetpackConnected( site ) ) {
		return `https://cloud.jetpack.com/backup/${ site.slug }`;
	}

	return isDashboardBackport()
		? `https://wordpress.com/backup/${ site.slug }`
		: `/sites/${ site.slug }/backups`;
}
