/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import StatTab from './tab';

/**
 * Style dependencies
 */
import './style.scss';

export default class extends React.Component {
	static displayName = 'StatsTabs';

	static propTypes = {
		activeKey: PropTypes.string,
		activeIndex: PropTypes.string,
		dataList: PropTypes.object,
		selectedTab: PropTypes.string,
		switchTab: PropTypes.func,
		tabs: PropTypes.array,
		borderless: PropTypes.bool,
	};

	render() {
		const {
			children,
			data,
			activeIndex,
			activeKey,
			tabs,
			switchTab,
			selectedTab,
			borderless,
		} = this.props;
		let statsTabs;

		if ( data && ! children ) {
			const activeData = find( data, { [ activeKey ]: activeIndex } );

			statsTabs = tabs.map( ( tab ) => {
				const hasData =
					activeData && activeData[ tab.attr ] >= 0 && activeData[ tab.attr ] !== null;

				const tabOptions = {
					attr: tab.attr,
					gridicon: tab.gridicon,
					className: tab.className,
					label: tab.label,
					loading: ! hasData,
					selected: selectedTab === tab.attr,
					tabClick: switchTab,
					value: hasData ? activeData[ tab.attr ] : null,
					format: tab.format,
				};

				return <StatTab key={ tabOptions.attr } { ...tabOptions } />;
			} );
		}

		return (
			<ul
				className={ classNames(
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
