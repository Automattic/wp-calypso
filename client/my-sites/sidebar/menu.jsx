/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';
import { localize } from 'i18n-calypso';

class SitesSidebarMenu extends React.Component {
	render() {
		const { extraChildren, translate } = this.props;
		return (
			<SidebarMenu>
				<ul>
					<SidebarItem
						key="stats"
						label={ translate( 'Stats' ) }
						link=""
						onNavigate={ null }
						icon="stats"
					/>
					<SidebarItem
						key="plan"
						label={ translate( 'Plan' ) }
						link=""
						onNavigate={ null }
						icon="clipboard"
					/>
					{ extraChildren }
				</ul>
			</SidebarMenu>
		);
	}
}

export default localize( SitesSidebarMenu );
