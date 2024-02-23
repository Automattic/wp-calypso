import { AnnualHighlightCards } from '@automattic/components';
import { useEffect, useMemo, useState } from 'react';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSiteStatsNormalizedData } from 'calypso/state/stats/lists/selectors';
import YearNavigation from './year-navigation';

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
	total: number;
};

const FOLLOWERS_QUERY = { type: 'all', max: 0 };

// Meant to replace annual-site-stats section
export default function AnnualHighlightsSection( { siteId }: { siteId: number } ) {
	// In January show the previous year.
	const [ year, setYear ] = useState(
		new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear()
	);
	const currentYear = new Date().getFullYear();
	const insights = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, 'statsInsights' )
	) as Insights;
	const followers = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, 'statsFollowers', FOLLOWERS_QUERY )
	) as Followers;
	const counts = useMemo( () => {
		const hasYearsData = Array.isArray( insights?.years );
		const currentYearData = insights?.years?.find( ( y ) => y.year === year.toString() );
		return {
			// TODO: Change `hasYearsData ? 0 : null` to `null` once insights API has been enhanced to
			//       return `years` data even for inactive years. This is a temporary & hacky fix.
			comments: currentYearData?.total_comments ?? ( hasYearsData ? 0 : null ),
			likes: currentYearData?.total_likes ?? ( hasYearsData ? 0 : null ),
			posts: currentYearData?.total_posts ?? ( hasYearsData ? 0 : null ),
			words: currentYearData?.total_words ?? ( hasYearsData ? 0 : null ),
			followers: year === currentYear ? followers?.total ?? null : null,
		};
	}, [ year, followers, insights, currentYear ] );

	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const viewMoreHref = siteSlug ? `/stats/annualstats/${ siteSlug }` : null;

	useEffect( () => {
		// Restart selected year when navigating to another page.
		setYear( new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : currentYear );
	}, [ siteId, currentYear ] );

	const oldestYear = useMemo(
		() =>
			insights?.years?.reduce(
				( lowest, current ) =>
					parseInt( current.year, 10 ) < lowest ? parseInt( current.year, 10 ) : lowest,
				currentYear
			) || currentYear,
		[ insights, currentYear ]
	);
	const disablePreviousArrow = year <= oldestYear;
	const disableNextArrow = year >= currentYear;

	const onYearChange = ( future?: boolean ) => {
		setYear( future ? year + 1 : year - 1 );
	};

	const navigation = (
		<YearNavigation
			disablePreviousArrow={ disablePreviousArrow }
			disableNextArrow={ disableNextArrow }
			onYearChange={ onYearChange }
		/>
	);

	return (
		<>
			{ siteId && (
				<>
					<QuerySiteStats siteId={ siteId } statType="statsInsights" />
					<QuerySiteStats siteId={ siteId } statType="statsFollowers" query={ FOLLOWERS_QUERY } />
				</>
			) }
			<AnnualHighlightCards
				counts={ counts }
				titleHref={ viewMoreHref }
				year={ year }
				navigation={ navigation }
				className="has-odyssey-stats-bg-color"
			/>
		</>
	);
}
