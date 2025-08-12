import { isSelfHostedJetpackConnected } from './site-types';
import type { Site } from '../data/types';

export function getBackupUrl( site: Site ) {
	return isSelfHostedJetpackConnected( site )
		? `https://cloud.jetpack.com/backup/${ site.slug }`
		: `https://wordpress.com/backup/${ site.slug }`;
}
