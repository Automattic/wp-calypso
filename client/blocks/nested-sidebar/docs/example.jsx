/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * internal dependencies
 */
import NestedSidebar from 'blocks/nested-sidebar';
import NestedSidebarLink from 'blocks/nested-sidebar/nested-sidebar-link';

import Sidebar from 'layout/sidebar';
import SidebarButton from 'layout/sidebar/button';
import SidebarFooter from 'layout/sidebar/footer';
import SidebarHeading from 'layout/sidebar/heading';
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';

class NestedSidebarExample extends Component {
	render() {
		return (
			<div className="test-sidebar-example">
				<NestedSidebar label="sidebar1">
					<NestedSidebarLink text="Site Pages" link="x" />
					<NestedSidebarLink text="Blog Posts" link="x" />
					<NestedSidebarLink text="Media" link="x" />
					<NestedSidebarLink text="Settings">
						<NestedSidebar label="sidebar2">
							<NestedSidebarLink text="General" link="x" />
							<NestedSidebarLink text="Writing" link="x" />
							<NestedSidebarLink text="Discussion" link="x" />
							<NestedSidebarLink text="Settings">
								<NestedSidebar label="sidebar3">
									<NestedSidebarLink text="General" link="x" />
									<NestedSidebarLink text="Writing" link="x" />
									<NestedSidebarLink text="Discussion" link="x" />
									<NestedSidebarLink text="Settings" />
								</NestedSidebar>
							</NestedSidebarLink>
						</NestedSidebar>
					</NestedSidebarLink>
				</NestedSidebar>
			</div>
		);
	}
}

NestedSidebarExample.displayName = 'NestedSidebar';

export default NestedSidebarExample;
