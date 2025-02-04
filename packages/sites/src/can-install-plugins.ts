import type { SiteExcerptData } from './site-excerpt-types';

export function canInstallPlugins( site: SiteExcerptData | null ): boolean {
	return site?.plan?.features?.active.find( ( feature ) => feature === 'install-plugins' )
		? true
		: false;
}
