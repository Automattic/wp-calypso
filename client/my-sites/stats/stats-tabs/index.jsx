import { TrendComparison } from '@automattic/components/src/highlight-cards/count-comparison-card';
import formatNumber from '@automattic/components/src/number-formatters/lib/format-number';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import StatTab from './tab';

import './style.scss';

class StatsTabs extends Component {
	static displayName = 'StatsTabs';

	static propTypes = {
		children: PropTypes.node,
		data: PropTypes.array,
		previousData: PropTypes.array,
		activeIndex: PropTypes.string,
		activeKey: PropTypes.string,
		tabs: PropTypes.array,
		switchTab: PropTypes.func,
		selectedTab: PropTypes.string,
		borderless: PropTypes.bool,
		aggregate: PropTypes.bool,
	};

	formatData = ( data, aggregate = true ) => {
		const { activeIndex, activeKey, tabs } = this.props;
		let activeData = {};
		if ( ! aggregate ) {
			activeData = find( data, { [ activeKey ]: activeIndex } );
		} else {
			data?.map( ( day ) =>
				tabs.map( ( tab ) => {
					if ( isFinite( day[ tab.attr ] ) ) {
						if ( ! ( tab.attr in activeData ) ) {
							activeData[ tab.attr ] = 0;
						}
						activeData[ tab.attr ] = activeData[ tab.attr ] + day[ tab.attr ];
					}
				} )
			);
		}
		return activeData;
	};

	render() {
		const {
			children,
			data,
			previousData,
			tabs,
			switchTab,
			selectedTab,
			borderless,
			aggregate,
			tabCountsAlt,
			tabCountsAltComp,
		} = this.props;

		let statsTabs;

		if ( data && ! children ) {
			const trendData = this.formatData( data, aggregate );
			const activeData = { ...tabCountsAlt, ...trendData };
			const activePreviousData = { ...tabCountsAltComp, ...this.formatData( previousData ) };

			statsTabs = tabs.map( ( tab ) => {
				const hasTrend = trendData?.[ tab.attr ] >= 0 && trendData[ tab.attr ] !== null;
				const hasData = activeData?.[ tab.attr ] >= 0 && activeData[ tab.attr ] !== null;
				const value = hasData ? activeData[ tab.attr ] : null;
				const previousValue =
					activePreviousData?.[ tab.attr ] !== null ? activePreviousData[ tab.attr ] : null;

				const tabOptions = {
					attr: tab.attr,
					icon: tab.icon,
					className: clsx( tab.className, { 'is-highlighted': previousData } ),
					label: tab.label,
					loading: ! hasData,
					selected: selectedTab === tab.attr,
					tabClick: hasTrend ? switchTab : undefined,
					value,
					format: tab.format,
				};

				return (
					<StatTab key={ tabOptions.attr } { ...tabOptions }>
						{ previousData && (
							<div className="stats-tabs__highlight">
								<span className="stats-tabs__highlight-value">{ formatNumber( value ) }</span>
								<TrendComparison count={ value } previousCount={ previousValue } />
							</div>
						) }
					</StatTab>
				);
			} );
		}

		return (
			<ul
				className={ clsx(
					'stats-tabs',
					{ 'is-enabled': !! data },
					{ 'is-borderless': borderless }
				) }
			>
				{ statsTabs || children }
			</ul>
		);
	}
}

export default localize( StatsTabs );
