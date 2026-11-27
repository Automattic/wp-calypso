// The same mapping as Jetpack's product store (get-product-icon.ts).
import ai from 'calypso/assets/images/jetpack/jetpack-product-icon-ai.svg';
import antispam from 'calypso/assets/images/jetpack/jetpack-product-icon-antispam.svg';
import backup from 'calypso/assets/images/jetpack/jetpack-product-icon-backup.svg';
import boost from 'calypso/assets/images/jetpack/jetpack-product-icon-boost.svg';
import creator from 'calypso/assets/images/jetpack/jetpack-product-icon-creator.svg';
import growth from 'calypso/assets/images/jetpack/jetpack-product-icon-growth.svg';
import jetpack from 'calypso/assets/images/jetpack/jetpack-product-icon-jetpack.webp';
import monitor from 'calypso/assets/images/jetpack/jetpack-product-icon-monitor.svg';
import scan from 'calypso/assets/images/jetpack/jetpack-product-icon-scan.svg';
import search from 'calypso/assets/images/jetpack/jetpack-product-icon-search.svg';
import security from 'calypso/assets/images/jetpack/jetpack-product-icon-security.svg';
import social from 'calypso/assets/images/jetpack/jetpack-product-icon-social.svg';
import stats from 'calypso/assets/images/jetpack/jetpack-product-icon-stats.svg';
import videopress from 'calypso/assets/images/jetpack/jetpack-product-icon-videopress.svg';

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
	[ 'jetpack-complete', jetpack ],
	[ 'jetpack-pro', jetpack ],
];

export function getJetpackProductIcon( slug: string ): string | undefined {
	return ICONS_BY_PREFIX.find( ( [ prefix ] ) => slug.startsWith( prefix ) )?.[ 1 ];
}
