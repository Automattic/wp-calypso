/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import StatTab from './tab';

export default React.createClass( {
	displayName: 'StatsTabs',

	propTypes: {
		activeKey: PropTypes.string,
		activeIndex: PropTypes.string,
		dataList: PropTypes.object,
		selectedTab: PropTypes.string,
		switchTab: PropTypes.func,
		tabs: PropTypes.array,
		borderless: PropTypes.bool
	},

	render() {
		const { children, data, activeIndex, activeKey, tabs, switchTab, selectedTab, borderless } = this.props;
		let statsTabs;

		if ( data ) {
			const activeData = find( data, { [ activeKey ]: activeIndex } );

			statsTabs = tabs.map( ( tab ) => {
				const hasData = activeData && ( activeData[ tab.attr ] >= 0 ) && ( activeData[ tab.attr ] !== null );

				const tabOptions = {
					attr: tab.attr,
					gridicon: tab.gridicon,
					className: tab.className,
					label: tab.label,
					loading: ! hasData,
					selected: selectedTab === tab.attr,
					tabClick: switchTab,
					value: hasData ? activeData[ tab.attr ] : null
				};

				return <StatTab key={ tabOptions.attr } { ...tabOptions } />;
			} );
		}

		return (
			<ul className={ classNames( 'stats-tabs', { 'is-enabled': !! data }, { 'is-borderless': borderless } ) }>
				{ statsTabs || children }
			</ul>
		);
	}
} );
