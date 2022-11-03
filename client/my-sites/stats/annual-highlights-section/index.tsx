import { AnnualHighlightCards } from '@automattic/components';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { getSiteStatsNormalizedData } from 'calypso/state/stats/lists/selectors';

type Insights = {
	day?: string;
	hour?: string;
	hourPercent?: number;
	hourlyViews?: object;
	years?: Array< {
		avg_comments: number;
		avg_images: number;
		avg_likes: number;
		avg_words: number;
		total_comments: number;
		total_images: number;
		total_likes: number;
		total_posts: number;
		total_words: number;
		year: string;
	} >;
};

type Followers = {
	subscribers: Array< object >;
	total_email: number;
	total_wpcom: number;
};

const FOLLOWERS_QUERY = { type: 'wpcom', max: 0 };

// Meant to replace annual-site-stats section
export default function AnnualHighlightsSection( { siteId }: { siteId: number } ) {
	const year = new Date().getFullYear();
	const insights = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, 'statsInsights' )
	) as Insights;
	const followers = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, 'statsFollowers', FOLLOWERS_QUERY )
	) as Followers;
	const counts = useMemo( () => {
		const currentYearData =
			insights?.years && insights.years?.find( ( y ) => y.year === year.toString() );
		return {
			comments: currentYearData?.total_comments ?? null,
			likes: currentYearData?.total_likes ?? null,
			posts: currentYearData?.total_posts ?? null,
			words: currentYearData?.total_words ?? null,
			followers: followers?.total_wpcom ?? null,
		};
	}, [ year, followers, insights ] );

	return (
		<>
			{ siteId && (
				<>
					<QuerySiteStats siteId={ siteId } statType="statsInsights" />
					<QuerySiteStats siteId={ siteId } statType="statsFollowers" query={ FOLLOWERS_QUERY } />
				</>
			) }
			<AnnualHighlightCards counts={ counts } year={ year } />
		</>
	);
}
