/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { isEqual, find, flowRight } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatsTabs from '../stats-tabs';
import StatsTab from '../stats-tabs/tab';
import Card from 'components/card';
import ElementChart from 'components/chart';
import { recordGoogleEvent } from 'state/analytics/actions';

class StatsSummaryChart extends Component {
	static propTypes = {
		data: PropTypes.array,
		dataKey: PropTypes.string.isRequired,
		isLoading: PropTypes.bool,
		labelClass: PropTypes.string.isRequired,
		labelKey: PropTypes.string.isRequired,
		sectionClass: PropTypes.string.isRequired,
		selected: PropTypes.object,
		tabLabel: PropTypes.string.isRequired,
	};

	static defaultProps = {
		onClick: () => {}
	};

	barClick = bar => {
		const selectedBar = find( this.props.data, data => isEqual( data, bar.data ) );
		this.props.recordGoogleEvent( 'Stats', 'Clicked Summary Chart Bar' );
		this.props.onClick( selectedBar );
	};

	buildChartData() {
		const { data, labelClass, numberFormat, sectionClass, selected, tabLabel } = this.props;
		return data.map( record => {
			const className = classNames( {
				'is-selected': isEqual( selected, record )
			} );

			const tooltipData = [
				{
					label: record.periodLabel || record.period,
					className: 'is-date-label',
					value: null
				},
				{
					label: tabLabel,
					className: sectionClass,
					value: numberFormat( record.value ),
					icon: labelClass
				}
			];

			return {
				label: record.period,
				value: record.value,
				nestedValue: null,
				className: className,
				data: record,
				tooltipData
			};
		} );
	}

	render() {
		const { dataKey, isLoading, labelClass, labelKey, numberFormat, selected, tabLabel } = this.props;
		const label = selected ? ': ' + selected[ labelKey ] : '';
		const tabOptions = {
			attr: labelKey,
			value: selected ? numberFormat( selected[ dataKey ] ) : null,
			selected: true,
			gridicon: labelClass,
			label: tabLabel + label
		};

		return (
			<Card className={ classNames( 'stats-module', 'is-summary-chart', { 'is-loading': isLoading } ) }>
				<StatsModulePlaceholder className="is-chart" isLoading={ isLoading } />
				<ElementChart
					data={ this.buildChartData() }
					barClick={ this.barClick } />
				<StatsTabs>
					<StatsTab { ...tabOptions } />
				</StatsTabs>
			</Card>
		);
	}
}

const connectComponent = connect(
	() => ( {} ),
	{ recordGoogleEvent }
);

export default flowRight(
	connectComponent,
	localize,
)( StatsSummaryChart );
