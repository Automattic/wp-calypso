/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

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
		const { children, dataList, activeIndex, activeKey, tabs, switchTab, selectedTab, borderless } = this.props;
		let statsTabs;

		if ( dataList ) {
			let data = dataList.response.data.filter( function( item ) {
				return item[ activeKey ] === activeIndex;
			} );

			if ( data.length ) {
				data = data.pop();
			}

			statsTabs = tabs.map( function( tab ) {
				const hasData = data && ( data[ tab.attr ] >= 0 ) && ( data[ tab.attr ] !== null );

				const tabOptions = {
					attr: tab.attr,
					gridicon: tab.gridicon,
					className: tab.className,
					label: tab.label,
					loading: ! hasData,
					selected: selectedTab === tab.attr,
					tabClick: switchTab,
					value: hasData ? data[ tab.attr ] : null
				};

				return <StatTab key={ tabOptions.attr } { ...tabOptions } />;
			} );
		}

		return (
			<ul className={ classNames( 'stats-tabs', { 'is-enabled': !! dataList }, { 'is-borderless': borderless } ) }>
				{ statsTabs || children }
			</ul>
		);
	}
} );
