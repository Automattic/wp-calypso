import useHomeLayoutQuery from 'calypso/data/home/use-home-layout-query';
import type { SiteExcerptData } from '@automattic/sites';

interface HomeLayout {
	primary?: string[];
	secondary?: string[];
}

/**
 * Determines if the launchpad should be shown first based on site creation flow.
 * @param site Site object
 * @returns Whether launchpad should be shown first
 */
export const useShouldShowLaunchpadFirst = ( site: SiteExcerptData ): boolean => {
	const { data: layout } = useHomeLayoutQuery( site?.ID );
	const shouldShowLaunchpad =
		( layout as HomeLayout )?.secondary?.find(
			( key: string ) => key === 'home-focused-launchpad'
		) !== undefined;

	return shouldShowLaunchpad;
};
