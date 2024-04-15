import { ShortenedNumber } from '@automattic/components';
import { Icon, arrowUp, arrowDown } from '@wordpress/icons';
import classNames from 'classnames';
import { SiteStats } from '../types';
import StatsSparkline from 'calypso/blocks/stats-sparkline';
import * as React from 'react';
import {useSelector} from 'calypso/state';
import {hasSiteStatsQueryFailed} from 'calypso/state/stats/lists/selectors';
import {SiteExcerptData} from '@automattic/sites';

type Props = {
	site: SiteExcerptData;
};

export default function SiteStatsColumn( { site }: Props ) {
	const hasStatsLoadingError = useSelector( ( state ) => {
		const siteId = site.ID;
		const query = {};
		const statType = 'statsInsights';
		return siteId && hasSiteStatsQueryFailed( state, siteId, statType, query );
	} );
	return (
		<span
			className={ classNames(
				'sites-overview__stats-trend',
			) }
		>
			{ ! hasStatsLoadingError && (
				<a href={ `/stats/day/${ site.slug }` }>
					<StatsSparkline siteId={ site.ID } showLoader={ true } />
				</a>
			) }
		</span>
	);
}
