import { __ } from '@wordpress/i18n';
import { getSiteStatus } from './site-status';
import { getSiteHostname } from './site-url';
import type { Site } from '../data/types';

export function getSiteName( site: Site ) {
	const status = getSiteStatus( site );
	if ( status === 'migration_pending' || status === 'migration_started' ) {
		return __( 'Incoming Migration' );
	}
	return site.name || getSiteHostname( site );
}
