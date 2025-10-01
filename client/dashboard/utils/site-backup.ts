import { isSelfHostedJetpackConnected } from './site-types';
import type { Site } from '@automattic/api-core';

export function getBackupUrl( site: Site ) {
	if ( isSelfHostedJetpackConnected( site ) ) {
		return `https://cloud.jetpack.com/backup/${ site.slug }`;
	}

	return [ '/v2', '/ciab' ].some( ( path ) => window?.location?.pathname?.startsWith( path ) )
		? `/sites/${ site.slug }/backups`
		: `https://wordpress.com/backup/${ site.slug }`;
}
