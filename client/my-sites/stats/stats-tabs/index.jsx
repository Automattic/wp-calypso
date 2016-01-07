/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import StatTab from './tab';

export default React.createClass( {
	displayName: 'StatsTabs',

	propTypes: {
		activeKey: PropTypes.string,
		dataList: PropTypes.object,
		switchTab: PropTypes.func,
		tabs: PropTypes.array
	},

	render() {
		const { dataList, activeIndex, activeKey, tabs, switchTab, selectedTab } = this.props;

		let data = dataList.response.data.filter( function( item ) {
			return item[ activeKey ] === activeIndex;
		} );

		if ( data.length ) {
			data = data.pop();
		}

		const statsTabs = tabs.map( function( tab ) {
			const hasData = data && ( data[ tab.attr ] >= 0 ) && ( data[ tab.attr ] !== null );

			const tabOptions = {
				attr: tab.attr,
				className: tab.className,
				label: tab.label,
				loading: ! hasData,
				selected: selectedTab === tab.attr,
				tabClick: switchTab,
				value: hasData ? data[ tab.attr ] : null
			};

			return <StatTab key={ tabOptions.attr } { ...tabOptions } />;
		} );

		return (
			<ul className="module-tabs is-enabled">
				{ statsTabs }
			</ul>
		);
	}
} );
