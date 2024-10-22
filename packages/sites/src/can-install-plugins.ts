import type { SiteExcerptData } from '@automattic/sites';

export function canInstallPlugins( site: SiteExcerptData | null ): boolean {
	return site?.plan?.features?.active.find( ( feature ) => feature === 'install-plugins' )
		? true
		: false;
}
