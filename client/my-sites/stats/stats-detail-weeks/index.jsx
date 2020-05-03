/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { flowRight } from 'lodash';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatsModuleContent from '../stats-module/content-text';
import QueryPostStats from 'components/data/query-post-stats';
import QueryPosts from 'components/data/query-posts';
import { withLocalizedMoment } from 'components/localized-moment';
import { getPostStats, isRequestingPostStats } from 'state/stats/posts/selectors';
import { getSitePost } from 'state/posts/selectors';
import toggleInfo from '../toggle-info';

const StatsPostDetailWeeks = ( props ) => {
	const {
		isRequesting,
		opened,
		post,
		postId,
		moment,
		numberFormat,
		siteId,
		stats,
		toggle,
		translate,
	} = props;
	const noData = ! stats;
	const infoIcon = opened ? 'info' : 'info-outline';
	const isLoading = isRequesting && noData;
	let tableHeader, tableRows, tableBody, highest;

	const classes = {
		'is-loading': isLoading,
		'is-showing-info': opened,
		'has-no-data': noData,
	};

	if ( stats && stats.weeks ) {
		const publishDate = post && post.post_date ? moment( post.post_date ) : null;
		highest = stats.highest_week_average;
		tableHeader = (
			<thead>
				<tr className="top">
					<th>{ translate( 'Mon' ) }</th>
					<th>{ translate( 'Tue' ) }</th>
					<th>{ translate( 'Wed' ) }</th>
					<th>{ translate( 'Thu' ) }</th>
					<th>{ translate( 'Fri' ) }</th>
					<th>{ translate( 'Sat' ) }</th>
					<th>{ translate( 'Sun' ) }</th>
					<th>{ translate( 'Total' ) }</th>
					<th>{ translate( 'Average' ) }</th>
				</tr>
			</thead>
		);

		tableRows = stats.weeks.map( ( week, index ) => {
			let cells = [];
			let iconType;
			const lastDay = week.days[ week.days.length - 1 ];
			const lastDayOfWeek = lastDay.day ? moment( lastDay.day, 'YYYY-MM-DD' ) : null;

			// If the end of this week is before post_date, return
			if (
				7 === week.days.length &&
				publishDate &&
				lastDayOfWeek &&
				lastDayOfWeek.isBefore( publishDate )
			) {
				return null;
			}

			// If there are fewer than 7 days in the first week, prepend blank days
			if ( week.days.length < 7 && 0 === index ) {
				for ( let j = 0; j < 7 - week.days.length; j++ ) {
					cells.push( <td key={ 'w0e' + j } /> );
				}
			}

			const dayCells = week.days.map( ( event, dayIndex ) => {
				const day = moment( event.day, 'YYYY-MM-DD' );
				const cellClass = classNames( {
					'highest-count': 0 !== highest && event.count === highest,
				} );

				return (
					<td key={ dayIndex } className={ cellClass }>
						<span className="stats-detail-weeks__date">{ day.format( 'MMM D' ) }</span>
						<span className="stats-detail-weeks__value">{ numberFormat( event.count ) }</span>
					</td>
				);
			} );

			cells = cells.concat( dayCells );

			// If there are fewer than 7 days in the last week, append blank days
			if ( week.days.length < 7 && 0 !== index ) {
				for ( let j = 0; j < 7 - week.days.length; j++ ) {
					cells.push( <td key={ 'w' + index + 'e' + j } /> );
				}
			}

			cells.push( <td key={ 'total' + index }>{ numberFormat( week.total ) }</td> );

			if ( 'number' === typeof week.change ) {
				const changeClass = classNames( {
					'is-rising': week.change > 0,
					'is-falling': week.change < 0,
					'is-same': week.change === 0,
				} );

				let displayValue = numberFormat( week.change, 2 ) + '%';

				if ( week.change > 0 ) {
					iconType = 'arrow-up';
				}

				if ( week.change < 0 ) {
					iconType = 'arrow-down';
				}

				if ( week.change === 0 ) {
					displayValue = translate( 'No change', {
						context: 'Stats: No change in stats value from prior period',
					} );
				}

				cells.push(
					<td key={ 'average' + index }>
						{ numberFormat( week.average ) }
						<span className={ 'stats-detail-weeks__value ' + changeClass } key={ 'change' + index }>
							{ iconType ? <Gridicon icon={ iconType } size={ 18 } /> : null }
							{ displayValue }
						</span>
					</td>
				);
			} else {
				cells.push( <td className="no-data" key={ 'change' + index } /> );
			}

			return <tr key={ index }>{ cells }</tr>;
		} );

		tableBody = <tbody>{ tableRows }</tbody>;
	}

	return (
		<Card className={ classNames( 'stats-module', 'is-expanded', 'is-post-weeks', classes ) }>
			<QueryPostStats siteId={ siteId } postId={ postId } />
			<QueryPosts siteId={ siteId } postId={ postId } />
			<div className="module-header">
				<h4 className="module-header-title">{ translate( 'Recent Weeks' ) }</h4>
				<ul className="module-header-actions">
					<li className="module-header-action toggle-info">
						<a
							href="#"
							className="module-header-action-link"
							aria-label={ translate( 'Show or hide panel information', {
								textOnly: true,
								context: 'Stats panel action',
							} ) }
							title={ translate( 'Show or hide panel information', {
								textOnly: true,
								context: 'Stats panel action',
							} ) }
							onClick={ toggle }
						>
							<Gridicon icon={ infoIcon } />
						</a>
					</li>
				</ul>
			</div>
			<StatsModuleContent className="module-content-text-info">
				<p>
					{ translate(
						'This table gives you an overview of how many views your post or page has received in the recent weeks.'
					) }
				</p>
				<span className="legend achievement">
					{ translate( '%(value)s = The highest recent value', {
						args: { value: numberFormat( highest ) },
						context: 'Legend for post stats page in Stats',
					} ) }
				</span>
			</StatsModuleContent>
			<StatsModulePlaceholder isLoading={ isLoading } />
			<div className="module-content-table">
				<div className="module-content-table-scroll">
					<table cellPadding="0" cellSpacing="0">
						{ tableHeader }
						{ tableBody }
					</table>
				</div>
			</div>
		</Card>
	);
};

const connectComponent = connect( ( state, { siteId, postId } ) => {
	return {
		stats: getPostStats( state, siteId, postId ),
		isRequesting: isRequestingPostStats( state, siteId, postId ),
		post: getSitePost( state, siteId, postId ),
	};
} );

export default flowRight(
	connectComponent,
	localize,
	toggleInfo,
	withLocalizedMoment
)( StatsPostDetailWeeks );
