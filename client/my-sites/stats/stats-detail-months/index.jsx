import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import { connect } from 'react-redux';
import QueryPostStats from 'calypso/components/data/query-post-stats';
import QueryPosts from 'calypso/components/data/query-posts';
import { getPostStats, isRequestingPostStats } from 'calypso/state/stats/posts/selectors';
import StatsModulePlaceholder from '../stats-module/placeholder';
import toggleInfo from '../toggle-info';

const StatsPostDetailMonths = ( props ) => {
	const { dataKey, isRequesting, postId, numberFormat, siteId, stats, total, translate } = props;
	const noData = ! stats;
	const isLoading = isRequesting && noData;
	const classes = {
		'is-loading': isLoading,
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
					<th>{ translate( 'May', { context: 'May abbreviation' } ) }</th>
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

				const cellClass = clsx( {
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
		<div className={ clsx( 'is-detail-months', classes ) }>
			<QueryPostStats siteId={ siteId } postId={ postId } />
			<QueryPosts siteId={ siteId } postId={ postId } />
			<StatsModulePlaceholder isLoading={ isLoading } />
			<table cellPadding="0" cellSpacing="0">
				{ tableHeader }
				{ tableBody }
			</table>
		</div>
	);
};

const connectComponent = connect( ( state, { siteId, postId } ) => {
	return {
		stats: getPostStats( state, siteId, postId ),
		isRequesting: isRequestingPostStats( state, siteId, postId ),
	};
} );

export default flowRight( connectComponent, localize, toggleInfo )( StatsPostDetailMonths );
