import { useTranslate } from 'i18n-calypso';
import type { StatsDefaultModuleProps, StatsQueryType } from '../types';

export const MAIN_STAT_TYPE = 'statsTopPosts';
export const SUB_STAT_TYPE = 'statsArchives';

export type StatType = typeof MAIN_STAT_TYPE | typeof SUB_STAT_TYPE;

export interface StatsModulePostsProps extends StatsDefaultModuleProps {
	query: StatsQueryType & { viewdType?: StatType };
}

export default function useOptionLabels() {
	const translate = useTranslate();

	return {
		[ MAIN_STAT_TYPE ]: {
			tabLabel: translate( 'Posts & pages' ),
			mainItemLabel: translate( 'Posts & pages' ),
			analyticsId: 'posts',
		},
		[ SUB_STAT_TYPE ]: {
			tabLabel: translate( 'Archive' ),
			mainItemLabel: translate( 'Archive pages' ),
			analyticsId: 'archives',
		},
	};
}
