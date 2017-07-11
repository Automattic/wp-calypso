/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { find, findIndex } from 'lodash';
import { moment, translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Delta from 'woocommerce/components/delta';
import { formatValue } from '../utils';
import { getPeriodFormat } from 'state/stats/lists/utils';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData
} from 'state/stats/lists/selectors';
import Sparkline from 'woocommerce/components/sparkline';
import Table from 'woocommerce/components/table';
import TableItem from 'woocommerce/components/table/table-item';
import TableRow from 'woocommerce/components/table/table-row';

class StoreStatsWidgetList extends Component {

	static propTypes = {
		data: PropTypes.array.isRequired,
		deltas: PropTypes.array.isRequired,
		selectedDate: PropTypes.string.isRequired,
		query: PropTypes.object.isRequired,
		widgets: PropTypes.array.isRequired,
	};

	getEndPeriod = ( date ) => {
		const { unit } = this.props.query;
		const periodFormat = getPeriodFormat( unit, date );
		return ( unit === 'week' )
			? moment( date, periodFormat ).endOf( 'isoWeek' ).format( 'YYYY-MM-DD' )
			: moment( date, periodFormat ).endOf( unit ).format( 'YYYY-MM-DD' );
	};

	getDeltasBySelectedPeriod = () => {
		return find( this.props.deltas, ( item ) =>
			item.period === this.props.selectedDate
		);
	};

	getDeltaByStat = ( stat ) => {
		return this.getDeltasBySelectedPeriod()[ stat ];
	};

	getSelectedIndex = ( data ) => {
		return findIndex( data, d => d.period === this.props.selectedDate );
	};

	render() {
		const { data, deltas, query, widgets } = this.props;
		const selectedIndex = this.getSelectedIndex( data );
		const firstRealKey = Object.keys( deltas[ selectedIndex ] ).filter( key => key !== 'period' )[ 0 ];
		const sincePeriod = this.getDeltaByStat( firstRealKey );
		const periodFormat = getPeriodFormat( query.unit, sincePeriod.reference_period );
		const values = [
			{
				key: 'title',
				label: translate( 'Stat' )
			},
			{
				key: 'value',
				label: translate( 'Value' )
			},
			{
				key: 'sparkline',
				label: translate( 'Trend' )
			},
			{
				key: 'delta',
				label: `${ translate( 'Since' ) } ${ moment( sincePeriod.reference_period, periodFormat ).format( 'MMM D' ) }`
			}
		];

		const titles = (
			<TableRow isHeader>
				{ values.map( ( value, i ) => {
					return (
						<TableItem
							className={ classnames( 'store-stats-widget-list__table-item', value.key ) }
							isHeader
							key={ i }
							isTitle={ 0 === i }
						>
							{ value.label }
						</TableItem>
					);
				} ) }
			</TableRow>
		);

		const widgetData = widgets.map( widget => {
			const timeSeries = data.map( row => +row[ widget.key ] );
			const delta = this.getDeltaByStat( widget.key );
			const deltaValue = ( delta.direction === 'is-undefined-increase' )
				? '-'
				: Math.abs( Math.round( delta.percentage_change * 100 ) );
			return {
				title: widget.title,
				value: formatValue( timeSeries[ selectedIndex ], widget.format, sincePeriod.currency ),
				sparkline: <Sparkline
					aspectRatio={ 3 }
					data={ timeSeries }
					highlightIndex={ selectedIndex }
					maxHeight={ 50 }
				/>,
				delta: <Delta
					value={ `${ deltaValue }%` }
					className={ `${ delta.favorable } ${ delta.direction }` }
				/>
			};
		} );

		return (
			<Table className="store-stats-widget-list" header={ titles }>
				{ widgetData.map( ( row, i ) => (
					<TableRow className="store-stats-widget-list__table-row" key={ i }>
						{ values.map( ( value, j ) => (
							<TableItem
								className={ classnames( 'store-stats-widget-list__table-item', value.key ) }
								key={ value.key }
								isTitle={ 0 === j }
							>
								{ row[ value.key ] }
							</TableItem>
						) ) }
					</TableRow>
				) ) }
			</Table>
		);
	}
}

export default connect(
	( state, { siteId, statType, query } ) => {
		const siteStats = getSiteStatsNormalizedData( state, siteId, statType, query );
		return {
			data: siteStats.data,
			deltas: siteStats.deltas,
			requesting: isRequestingSiteStatsForQuery( state, siteId, statType, query ),
		};
	}
)( StoreStatsWidgetList );
