import React from 'react';

import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';

export default class SitesSidebarMenu extends React.Component {

	render() {
		return (
			<SidebarMenu>
				<ul>
					<SidebarItem
						label={ this.translate( 'Stats' ) }
						link=""
						onNavigate={ null }
						icon="stats"
					/>
					<SidebarItem
						label={ this.translate( 'Plan' ) }
						link=""
						onNavigate={ null }
						icon="clipboard"
					/>
				</ul>
			</SidebarMenu>
		);
	}
}
