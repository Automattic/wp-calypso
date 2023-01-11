import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import { Icon, video } from '@wordpress/icons';
import classNames from 'classnames';
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
				icon = (
					<svg
						className="gridicon"
						width="24"
						height="24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="m4 13 .67.336.003-.005a2.42 2.42 0 0 1 .094-.17c.071-.122.18-.302.329-.52.298-.435.749-1.017 1.359-1.598C7.673 9.883 9.498 8.75 12 8.75s4.326 1.132 5.545 2.293c.61.581 1.061 1.163 1.36 1.599a8.29 8.29 0 0 1 .422.689l.002.005L20 13l.67-.336v-.003l-.003-.005-.008-.015-.028-.052a9.752 9.752 0 0 0-.489-.794 11.6 11.6 0 0 0-1.562-1.838C17.174 8.617 14.998 7.25 12 7.25S6.827 8.618 5.42 9.957c-.702.669-1.22 1.337-1.563 1.839a9.77 9.77 0 0 0-.516.845l-.008.015-.002.005-.001.002v.001L4 13Zm8 3a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
						/>
					</svg>
				);
				break;
			default:
		}

		return icon;
	}

	renderEmptyState() {
		return <StatsEmptyState stateType={ this.props.tabLabel } />;
	}

	buildChartData() {
		const { data, chartType, numberFormat, sectionClass, selected, tabLabel } = this.props;

		return data.map( ( record ) => {
			const className = classNames( {
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
					value: numberFormat( record.value ),
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
		const { dataKey, isLoading, chartType, labelKey, numberFormat, selected, tabLabel } =
			this.props;
		const label = selected ? ': ' + selected[ labelKey ] : '';
		const tabOptions = {
			attr: labelKey,
			value: selected ? numberFormat( selected[ dataKey ] ) : null,
			selected: true,
			icon: this.iconByChartType( chartType ),
			label: tabLabel + label,
		};

		const isFeatured = config.isEnabled( 'stats/enhance-post-detail' );

		return isFeatured ? (
			<div
				className={ classNames( 'stats-module', 'is-summary-chart', { 'is-loading': isLoading } ) }
			>
				<StatsModulePlaceholder className="is-chart" isLoading={ isLoading } />
				<ElementChart data={ this.buildChartData() } barClick={ this.barClick }>
					{ this.renderEmptyState() }
				</ElementChart>
			</div>
		) : (
			<Card
				className={ classNames( 'stats-module', 'is-summary-chart', { 'is-loading': isLoading } ) }
			>
				<StatsModulePlaceholder className="is-chart" isLoading={ isLoading } />
				<ElementChart data={ this.buildChartData() } barClick={ this.barClick }>
					{ this.renderEmptyState() }
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
