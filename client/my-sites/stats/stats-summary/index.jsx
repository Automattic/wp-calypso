import { Card } from '@automattic/components';
import { eye } from '@automattic/components/src/icons';
import { formatNumber } from '@automattic/number-formatters';
import { Icon, video } from '@wordpress/icons';
import clsx from 'clsx';
import isEqual from 'fast-deep-equal/es6';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import ElementChart from 'calypso/components/chart';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import StatsEmptyState from '../stats-empty-state';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatsTabs from '../stats-tabs';
import StatsTab from '../stats-tabs/tab';

import './style.scss';

class StatsSummaryChart extends Component {
	static propTypes = {
		data: PropTypes.array,
		dataKey: PropTypes.string.isRequired,
		isLoading: PropTypes.bool,
		chartType: PropTypes.string.isRequired,
		labelKey: PropTypes.string.isRequired,
		onClick: PropTypes.func,
		sectionClass: PropTypes.string.isRequired,
		selected: PropTypes.object,
		tabLabel: PropTypes.string.isRequired,
		type: PropTypes.string,
	};

	barClick = ( bar ) => {
		const selectedBar = this.props.data?.find( ( data ) => isEqual( data, bar.data ) );
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
					value: record.formattedValue ?? formatNumber( record.value ),
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
		const { dataKey, isLoading, chartType, labelKey, onClick, selected, tabLabel, type } =
			this.props;
		// Without an onClick handler the bars are hover-tooltip only: no click
		// handling (which would also log a Google event) and no pointer cursor
		// suggesting the bars do something.
		const chartProps = {
			data: this.buildChartData(),
			...( onClick ? { barClick: this.barClick } : {} ),
		};
		const label = selected ? ': ' + selected[ labelKey ] : '';
		const tabOptions = {
			attr: labelKey,
			value: selected ? formatNumber( selected[ dataKey ] ) : null,
			selected: true,
			icon: this.iconByChartType( chartType ),
			label: tabLabel + label,
		};

		// The post and video summaries have been modernized to fresh styling.
		const isModernized = 'post' === type || 'video' === type;

		return isModernized ? (
			<div
				className={ clsx( 'is-summary-chart', {
					'is-loading': isLoading,
					'is-hover-only': ! onClick,
				} ) }
			>
				<StatsModulePlaceholder className="is-chart" isLoading={ isLoading } />
				<ElementChart { ...chartProps }>
					<StatsEmptyState />
				</ElementChart>
			</div>
		) : (
			<Card
				className={ clsx( 'stats-module', 'is-summary-chart', {
					'is-loading': isLoading,
					'is-hover-only': ! onClick,
				} ) }
			>
				<StatsModulePlaceholder className="is-chart" isLoading={ isLoading } />
				<ElementChart { ...chartProps }>
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

export default compose( connectComponent, localize )( StatsSummaryChart );
