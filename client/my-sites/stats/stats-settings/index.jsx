/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import StatsNavigation from '../stats-navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import Main from 'components/main';

class StatsSettings extends Component {
	render() {
		return (
			<Main wideLayout={ true }>
				<SidebarNavigation />
				<StatsNavigation section="settings" />
			</Main>
		);
	}
}

 export default StatsSettings;
