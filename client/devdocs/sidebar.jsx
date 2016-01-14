/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import Sidebar from 'layout/sidebar';
import SidebarHeading from 'layout/sidebar/heading';
import SidebarMenu from 'layout/sidebar/menu';

export default React.createClass( {

	displayName: 'DevdocsSidebar',

	mixins: [ PureRenderMixin ],

	render() {
		return (
			<Sidebar>
				<h1 className="devdocs__title">Calypso Docs</h1>
				<SidebarMenu>
					<ul>
						<li className="devdocs__navigation-item">
							<Gridicon icon="search" />
							<a className="devdocs__sidebar-item" href="/devdocs">
								Search
							</a>
						</li>
						<li className="devdocs__navigation-item">
							<Gridicon icon="location" />
							<a className="devdocs__sidebar-item" href="/devdocs/docs/guide/index.md">
								The Calypso Guide
							</a>
						</li>
						<li className="devdocs__navigation-item">
							<Gridicon icon="pencil" />
							<a className="devdocs__sidebar-item" href="/devdocs/CONTRIBUTING.md">
								Contributing
							</a>
						</li>
					</ul>
				</SidebarMenu>
				<SidebarHeading>Live Docs</SidebarHeading>
				<SidebarMenu>
					<ul>
						<li className="devdocs__navigation-item">
							<Gridicon icon="layout-blocks" />
							<a className="devdocs__sidebar-item" href="/devdocs/design">
								UI Components
							</a>
						</li>
						<li className="devdocs__navigation-item">
							<Gridicon icon="custom-post-type" />
							<a className="devdocs__sidebar-item" href="/devdocs/app-components">
								App Components
							</a>
						</li>
						<li className="devdocs__navigation-item">
							<Gridicon icon="heading" />
							<a className="devdocs__sidebar-item" href="/devdocs/design/typography">
								Typography
							</a>
						</li>
						<li className="devdocs__navigation-item">
							<Gridicon icon="types" />
							<a className="devdocs__sidebar-item" href="/devdocs/docs/icons.md">
								Icons
							</a>
						</li>
					</ul>
				</SidebarMenu>
			</Sidebar>
		);
	}
} );
