import clsx from 'clsx';
import PropTypes from 'prop-types';
import React from 'react';
import Chart from 'calypso/components/chart';
import StatsEmptyState from '../stats-empty-state';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatTabs from '../stats-tabs';

const Header = ( { children } ) => children;
const Content = ( { children } ) => children;

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
	aggregate = false,
} ) => {
	const slots = {
		header: null,
		content: null,
	};

	React.Children.forEach( children, ( child ) => {
		if ( ! React.isValidElement( child ) ) {
			return;
		}

		if ( child.type === Header ) {
			slots.header = child.props.children;
		} else if ( child.type === Content ) {
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
				aggregate={ aggregate }
			/>
		</div>
	);
};

StatsChartBase.Header = Header;
StatsChartBase.Content = Content;

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
	aggregate: PropTypes.bool,
};

export default StatsChartBase;
