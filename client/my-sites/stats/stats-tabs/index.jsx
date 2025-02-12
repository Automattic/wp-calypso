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

	formatData = ( data, aggregate = false ) => {
		const { activeIndex, activeKey, tabs } = this.props;
		let activeData = {};
		if ( ! aggregate ) {
			activeData = find( data, { [ activeKey ]: activeIndex } );
		} else {
			data?.map( ( day ) =>
				tabs.map( ( tab ) => {
					// Exclude non-numeric values, e.g., NULL from unsupported stats fields.
					if ( Number.isFinite( day[ tab.attr ] ) ) {
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
			const activePreviousData = {
				...tabCountsAltComp,
				...this.formatData( previousData, aggregate ),
			};

			statsTabs = tabs.map( ( tab ) => {
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
					tabClick: switchTab,
					value,
					previousValue,
					format: tab.format,
					hasPreviousData: !! previousData,
				};

				return <StatTab key={ tabOptions.attr } { ...tabOptions } />;
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
