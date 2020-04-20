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
import { getPostStats, isRequestingPostStats } from 'state/stats/posts/selectors';
import toggleInfo from '../toggle-info';

const StatsPostDetailMonths = ( props ) => {
	const {
		dataKey,
		isRequesting,
		opened,
		postId,
		numberFormat,
		siteId,
		stats,
		title,
		toggle,
		total,
		translate,
	} = props;
	const noData = ! stats;
	const infoIcon = opened ? 'info' : 'info-outline';
	const isLoading = isRequesting && noData;
	const classes = {
		'is-loading': isLoading,
		'is-showing-info': opened,
		'has-no-data': noData,
	};

	let tableHeader;
	let tableBody;
	let highest;
	if ( stats && stats[ dataKey ] ) {
		tableHeader = (
			<thead>
				<tr className="top">
					<th className="spacer">0000</th>
					<th>{ translate( 'Jan' ) }</th>
					<th>{ translate( 'Feb' ) }</th>
					<th>{ translate( 'Mar' ) }</th>
					<th>{ translate( 'Apr' ) }</th>
					<th>{ translate( 'May' ) }</th>
					<th>{ translate( 'Jun' ) }</th>
					<th>{ translate( 'Jul' ) }</th>
					<th>{ translate( 'Aug' ) }</th>
					<th>{ translate( 'Sep' ) }</th>
					<th>{ translate( 'Oct' ) }</th>
					<th>{ translate( 'Nov' ) }</th>
					<th>{ translate( 'Dec' ) }</th>
					<th>{ total }</th>
				</tr>
			</thead>
		);

		highest = 'years' === dataKey ? stats.highest_month : stats.highest_day_average;

		const tableRows = Object.keys( stats[ dataKey ] ).map( ( i ) => {
			const year = stats[ dataKey ][ i ];
			const cells = [];

			cells.push(
				<td key={ 'header' + i } className="stats-detail__row-label">
					{ i }
				</td>
			);

			for ( let j = 1; j <= 12; j++ ) {
				const hasData = year.months[ j ] || 0 === year.months[ j ];

				const cellClass = classNames( {
					'highest-count': 0 !== highest && year.months[ j ] === highest,
					'has-no-data': ! hasData,
				} );

				if ( hasData ) {
					cells.push(
						<td className={ cellClass } key={ 'y' + i + 'm' + j }>
							<span className="value">{ numberFormat( year.months[ j ] ) }</span>
						</td>
					);
				} else {
					cells.push( <td className={ cellClass } key={ 'y' + i + 'm' + j } /> );
				}
			}

			cells.push(
				<td key={ 'total' + i }>
					{ numberFormat( 'years' === dataKey ? year.total : year.overall ) }
				</td>
			);

			return <tr key={ i }>{ cells }</tr>;
		} );

		tableBody = <tbody>{ tableRows }</tbody>;
	}

	return (
		<Card className={ classNames( 'stats-module', 'is-expanded', 'is-post-months', classes ) }>
			<QueryPostStats siteId={ siteId } postId={ postId } />
			<QueryPosts siteId={ siteId } postId={ postId } />
			<div className="module-header">
				<h4 className="module-header-title">{ title }</h4>
				<ul className="module-header-actions">
					<li className="module-header-action toggle-info">
						<a
							href="#"
							className="module-header-action-link"
							aria-label={ translate( 'Show or hide panel information', {
								context: 'Stats panel action',
							} ) }
							title={ translate( 'Show or hide panel information', {
								context: 'Stats panel action',
							} ) }
							onClick={ toggle }
						>
							{ infoIcon ? <Gridicon icon={ infoIcon } /> : null }
						</a>
					</li>
				</ul>
			</div>
			<StatsModuleContent className="module-content-text-info">
				<p>
					{ translate(
						'This table gives you an overview of how many views your post or page has received.',
						{
							context: 'Info box description for post stats page in Stats',
						}
					) }
				</p>
				<span className="legend achievement">
					{ translate( '%(value)s = The all-time highest value', {
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
	};
} );

export default flowRight( connectComponent, localize, toggleInfo )( StatsPostDetailMonths );
