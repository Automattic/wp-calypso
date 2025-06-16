import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import type { StatsDefaultModuleProps, StatsQueryType } from '../types';

export const MAIN_STAT_TYPE = 'statsTopPosts';
export const SUB_STAT_TYPE = 'statsArchives';

export type StatType = typeof MAIN_STAT_TYPE | typeof SUB_STAT_TYPE;

export interface StatsModulePostsProps extends StatsDefaultModuleProps {
	query: StatsQueryType & { viewType?: StatType };
}

export function validQueryViewType( statType: StatType = MAIN_STAT_TYPE ) {
	if ( ! config.isEnabled( 'stats/archive-breakdown' ) ) {
		return MAIN_STAT_TYPE;
	}

	return [ MAIN_STAT_TYPE, SUB_STAT_TYPE ].includes( statType ) ? statType : MAIN_STAT_TYPE;
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
