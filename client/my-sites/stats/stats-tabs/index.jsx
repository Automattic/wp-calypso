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
		activeKey: PropTypes.string,
		activeIndex: PropTypes.string,
		selectedTab: PropTypes.string,
		switchTab: PropTypes.func,
		tabs: PropTypes.array,
		borderless: PropTypes.bool,
	};

	render() {
		const { children, data, activeIndex, activeKey, tabs, switchTab, selectedTab, borderless } =
			this.props;
		let statsTabs;

		if ( data && ! children ) {
			const activeData = find( data, { [ activeKey ]: activeIndex } );
			statsTabs = tabs.map( ( tab ) => {
				const hasData =
					activeData && activeData[ tab.attr ] >= 0 && activeData[ tab.attr ] !== null;

				const tabOptions = {
					attr: tab.attr,
					icon: tab.icon,
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
