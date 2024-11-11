import clsx from 'clsx';
import PropTypes from 'prop-types';
import React from 'react';
import Chart from 'calypso/components/chart';
import StatsEmptyState from '../stats-empty-state';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatTabs from '../stats-tabs';

const StatsChartBase = ( {
	className,
	isLoading,
	chartData = [],
	barClick,
	counts,
	charts,
	switchTab,
	chartTab,
	queryDate,
	children,
} ) => {
	// Improved slot handling
	const slots = {
		header: null,
		content: null,
	};

	React.Children.forEach( children, ( child ) => {
		if ( ! React.isValidElement( child ) ) {
			return;
		}

		// Check for static components and extract their children
		if ( child.type === StatsChartBase.Header ) {
			slots.header = child.props.children;
		} else if ( child.type === StatsChartBase.Content ) {
			slots.content = child.props.children;
		}
	} );

	const classes = clsx( 'stats-chart-tabs', className, {
		'is-loading': isLoading,
		'has-less-than-three-bars': chartData.length < 3,
	} );

	return (
		<div className={ classes }>
			{ slots.header && <div className="stats-chart-tabs__header-wrapper">{ slots.header }</div> }

			<div className="stats-chart-tabs__content">
				{ isLoading && <StatsModulePlaceholder className="is-chart" isLoading /> }
				{ ! isLoading &&
					( slots.content || (
						<Chart barClick={ barClick } data={ chartData } minBarWidth={ 35 }>
							{ chartData.length === 0 && <StatsEmptyState /> }
						</Chart>
					) ) }
			</div>

			<StatTabs
				data={ counts }
				tabs={ charts }
				switchTab={ switchTab }
				selectedTab={ chartTab }
				activeIndex={ queryDate }
				activeKey="period"
			/>
		</div>
	);
};

// Define slot components with proper PropTypes
StatsChartBase.Header = ( { children } ) => children;
StatsChartBase.Content = ( { children } ) => children;

StatsChartBase.Header.displayName = 'StatsChartBase.Header';
StatsChartBase.Content.displayName = 'StatsChartBase.Content';

StatsChartBase.propTypes = {
	className: PropTypes.string,
	isLoading: PropTypes.bool,
	chartData: PropTypes.array,
	barClick: PropTypes.func,
	counts: PropTypes.array,
	charts: PropTypes.array,
	switchTab: PropTypes.func,
	chartTab: PropTypes.string,
	queryDate: PropTypes.string,
	children: PropTypes.node,
};

export default StatsChartBase;
