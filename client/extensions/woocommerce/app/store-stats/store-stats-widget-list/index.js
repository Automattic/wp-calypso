/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { findIndex } from 'lodash';
import { moment, translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Delta from 'woocommerce/components/delta';
import { formatValue, getDelta } from '../utils';
import { getPeriodFormat } from 'state/stats/lists/utils';
import { getSiteStatsNormalizedData } from 'state/stats/lists/selectors';
import Sparkline from 'woocommerce/components/d3/sparkline';
import Table from 'woocommerce/components/table';
import TableItem from 'woocommerce/components/table/table-item';
import TableRow from 'woocommerce/components/table/table-row';
import { UNITS } from 'woocommerce/app/store-stats/constants';

class StoreStatsWidgetList extends Component {
	static propTypes = {
		data: PropTypes.array.isRequired,
		deltas: PropTypes.array.isRequired,
		query: PropTypes.object.isRequired,
		selectedDate: PropTypes.string.isRequired,
		widgets: PropTypes.array.isRequired,
	};

	render() {
		const { data, deltas, query, selectedDate, widgets } = this.props;
		const { unit } = query;
		const selectedIndex = findIndex( data, d => d.period === selectedDate );
		const firstRealKey = Object.keys( deltas[ selectedIndex ] ).filter(
			key => key !== 'period'
		)[ 0 ];
		const sincePeriod = getDelta( deltas, selectedDate, firstRealKey );
		const periodFormat = getPeriodFormat( unit, sincePeriod.reference_period );
		const values = [
			{
				key: 'title',
				label: translate( 'Stat' ),
			},
			{
				key: 'value',
				label: translate( 'Value' ),
			},
			{
				key: 'sparkline',
				label: translate( 'Trend' ),
			},
			{
				key: 'delta',
				label: `${ translate( 'Since' ) } \
				${ moment( sincePeriod.reference_period, periodFormat ).format( UNITS[ unit ].shortFormat ) }`,
			},
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
			const delta = getDelta( deltas, selectedDate, widget.key );
			const deltaValue =
				delta.direction === 'is-undefined-increase'
					? '-'
					: Math.abs( Math.round( delta.percentage_change * 100 ) );
			return {
				title: widget.title,
				value: formatValue( timeSeries[ selectedIndex ], widget.format, sincePeriod.currency ),
				sparkline: (
					<Sparkline
						aspectRatio={ 3 }
						data={ timeSeries }
						highlightIndex={ selectedIndex }
						maxHeight={ 50 }
					/>
				),
				delta: (
					<Delta
						value={ `${ deltaValue }%` }
						className={ `${ delta.favorable } ${ delta.direction }` }
					/>
				),
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

export default connect( ( state, { siteId, statType, query } ) => {
	const siteStats = getSiteStatsNormalizedData( state, siteId, statType, query );
	return {
		data: siteStats.data,
		deltas: siteStats.deltas,
	};
} )( StoreStatsWidgetList );
