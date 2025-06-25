import { Card } from '@automattic/components';
import { eye } from '@automattic/components/src/icons';
import { formatNumber } from '@automattic/number-formatters';
import { Icon, video } from '@wordpress/icons';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { isEqual, find, flowRight } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import ElementChart from 'calypso/components/chart';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import StatsEmptyState from '../stats-empty-state';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatsTabs from '../stats-tabs';
import StatsTab from '../stats-tabs/tab';

class StatsSummaryChart extends Component {
	static propTypes = {
		data: PropTypes.array,
		dataKey: PropTypes.string.isRequired,
		isLoading: PropTypes.bool,
		chartType: PropTypes.string.isRequired,
		labelKey: PropTypes.string.isRequired,
		sectionClass: PropTypes.string.isRequired,
		selected: PropTypes.object,
		tabLabel: PropTypes.string.isRequired,
		type: PropTypes.string,
	};

	static defaultProps = {
		onClick: () => {},
	};

	barClick = ( bar ) => {
		const selectedBar = find( this.props.data, ( data ) => isEqual( data, bar.data ) );
		this.props.recordGoogleEvent( 'Stats', 'Clicked Summary Chart Bar' );
		this.props.onClick( selectedBar );
	};

	iconByChartType( chartType ) {
		let icon = null;

		switch ( chartType ) {
			case 'video':
				icon = <Icon className="gridicon" icon={ video } />;
				break;
			case 'views':
				icon = <Icon className="gridicon" icon={ eye } />;
				break;
			default:
		}

		return icon;
	}

	buildChartData() {
		const { data, chartType, sectionClass, selected, tabLabel } = this.props;

		return data.map( ( record ) => {
			const className = clsx( {
				'is-selected': isEqual( selected, record ),
			} );

			const tooltipData = [
				{
					label: record.periodLabel || record.period,
					className: 'is-date-label',
					value: null,
				},
				{
					label: tabLabel,
					className: sectionClass,
					value: formatNumber( record.value ),
					icon: this.iconByChartType( chartType ),
				},
			];

			return {
				label: record.period,
				value: record.value,
				nestedValue: null,
				className: className,
				data: record,
				tooltipData,
			};
		} );
	}

	render() {
		const { dataKey, isLoading, chartType, labelKey, selected, tabLabel, type } = this.props;
		const label = selected ? ': ' + selected[ labelKey ] : '';
		const tabOptions = {
			attr: labelKey,
			value: selected ? formatNumber( selected[ dataKey ] ) : null,
			selected: true,
			icon: this.iconByChartType( chartType ),
			label: tabLabel + label,
		};

		// The StatsPostSummary has been modernized to fresh styling.
		const isModernized = 'post' === type;

		return isModernized ? (
			<div className={ clsx( 'is-summary-chart', { 'is-loading': isLoading } ) }>
				<StatsModulePlaceholder className="is-chart" isLoading={ isLoading } />
				<ElementChart data={ this.buildChartData() } barClick={ this.barClick }>
					<StatsEmptyState />
				</ElementChart>
			</div>
		) : (
			<Card className={ clsx( 'stats-module', 'is-summary-chart', { 'is-loading': isLoading } ) }>
				<StatsModulePlaceholder className="is-chart" isLoading={ isLoading } />
				<ElementChart data={ this.buildChartData() } barClick={ this.barClick }>
					<StatsEmptyState />
				</ElementChart>
				<StatsTabs>
					<StatsTab { ...tabOptions } />
				</StatsTabs>
			</Card>
		);
	}
}

const connectComponent = connect( null, { recordGoogleEvent } );

export default flowRight( connectComponent, localize )( StatsSummaryChart );
