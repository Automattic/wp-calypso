/**
 * Jetpack's product icons, copied from client/assets/images/jetpack/ (the
 * Dashboard does not import Calypso client code) and mapped the way Jetpack's
 * product store maps them
 * (client/my-sites/plans/jetpack-plans/product-store/utils/get-product-icon.ts):
 * the backup storage add-ons take the Backup icon.
 */
import ai from './ai.svg';
import antispam from './antispam.svg';
import backup from './backup.svg';
import boost from './boost.svg';
import complete from './complete.svg';
import creator from './creator.svg';
import growth from './growth.svg';
import monitor from './monitor.svg';
import scan from './scan.svg';
import search from './search.svg';
import security from './security.svg';
import social from './social.svg';
import stats from './stats.svg';
import videopress from './videopress.svg';

const ICONS_BY_PREFIX: [ string, string ][] = [
	[ 'jetpack-backup', backup ],
	[ 'jetpack-security', security ],
	[ 'jetpack-social', social ],
	[ 'jetpack-scan', scan ],
	[ 'jetpack-anti-spam', antispam ],
	[ 'jetpack-search', search ],
	[ 'jetpack-videopress', videopress ],
	[ 'jetpack-ai', ai ],
	[ 'jetpack-stats', stats ],
	[ 'jetpack-monitor', monitor ],
	[ 'jetpack-boost', boost ],
	[ 'jetpack-creator', creator ],
	[ 'jetpack-growth', growth ],
	[ 'jetpack-complete', complete ],
];

export function getJetpackProductIcon( slug: string ): string | undefined {
	return ICONS_BY_PREFIX.find( ( [ prefix ] ) => slug.startsWith( prefix ) )?.[ 1 ];
}
