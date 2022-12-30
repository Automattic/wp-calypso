import { Spinner } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { values, isEmpty } from 'lodash';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSiteStatsPostStreakData } from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import Month from './month';
import YearNavigation from './year-navigation';

import './style.scss';

const subtractYearsFromNow = ( amount ) => {
	const date = new Date();
	date.setFullYear( date.getFullYear() - amount );
	return date;
};

// format the date to the YYYY-MM-DD pattern
const formatDate = ( date ) => {
	const year = date.toLocaleString( 'default', { year: 'numeric' } );
	const month = date.toLocaleString( 'default', { month: '2-digit' } );
	const day = date.toLocaleString( 'default', { day: '2-digit' } );

	return year + '-' + month + '-' + day;
};

const buildQuery = ( previousYear, gmtOffset ) => {
	const startYear = subtractYearsFromNow( previousYear );
	const startDate = new Date( startYear.getFullYear(), startYear.getMonth(), 1 ); // returns the first day of the month
	const endYear = subtractYearsFromNow( previousYear - 1 );
	const endDate = new Date( endYear.getFullYear(), endYear.getMonth() + 1, 0 ); // returns the last day of the month

	return {
		startDate: formatDate( startDate ),
		endDate: formatDate( endDate ),
		gmtOffset,
		max: 3000,
	};
};

export default function PostTrends() {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const gmtOffset = useSelector( ( state ) => getSiteOption( state, siteId, 'gmt_offset' ) );
	const [ counter, setCounter ] = useState( 1 );
	const query = useMemo( () => buildQuery( counter, gmtOffset ), [ counter, gmtOffset ] );
	const streakData = useSelector( ( state ) => getSiteStatsPostStreakData( state, siteId, query ) );
	const isLoading = useMemo( () => isEmpty( streakData ), [ streakData ] );

	const getMonthComponents = () => {
		// Compute maximum per-day post count from the streakData. It's used to scale the chart.
		const maxPosts = Math.max( ...values( streakData ) );
		const months = [];

		for ( let i = 11; i >= 0; i-- ) {
			const date = subtractYearsFromNow( counter - 1 );
			const startDate = new Date( date.getFullYear(), date.getMonth() - i, 1 );

			months.push(
				<Month key={ i } startDate={ startDate } streakData={ streakData } max={ maxPosts } />
			);
		}

		return months;
	};

	const onYearChange = ( moveToNext ) => {
		if ( moveToNext ) {
			if ( counter > 1 ) {
				setCounter( counter - 1 );
			}
		} else {
			setCounter( counter + 1 );
		}
	};

	return (
		<div className="post-trends">
			{ siteId && <QuerySiteStats siteId={ siteId } statType="statsStreak" query={ query } /> }

			<div className="post-trends__heading">
				<h1 className="post-trends__title">{ translate( 'Posting activity' ) }</h1>

				<YearNavigation
					disablePreviousArrow={ false }
					disableNextArrow={ counter === 1 }
					onYearChange={ onYearChange }
				/>
			</div>
			{ isLoading && (
				<div className="post-trends__spinner-container">
					<Spinner />
				</div>
			) }
			<div className="post-trends__wrapper">
				<div
					className={ classNames( 'post-trends__year', {
						'post-trends__year-loading': isLoading,
					} ) }
				>
					{ getMonthComponents() }
				</div>
				<div className="post-trends__key-container">
					<span className="post-trends__key-label">
						{ translate( 'Fewer Posts', {
							context: 'Legend label in stats post trends visualization',
						} ) }
					</span>
					<ul className="post-trends__key">
						<li className="post-trends__key-day is-today" />
						<li className="post-trends__key-day is-level-1" />
						<li className="post-trends__key-day is-level-2" />
						<li className="post-trends__key-day is-level-3" />
						<li className="post-trends__key-day is-level-4" />
					</ul>
					<span className="post-trends__key-label">
						{ translate( 'More Posts', {
							context: 'Legend label in stats post trends visualization',
						} ) }
					</span>
				</div>
			</div>
		</div>
	);
}
