/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Sidebar from 'layout/sidebar';
import SidebarHeading from 'layout/sidebar/heading';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarItem from 'layout/sidebar/item';

export default class DevdocsSidebar extends React.PureComponent {
	static displayName = 'DevdocsSidebar';

	isItemSelected( itemPath, isStrict = true ) {
		const { path } = this.props;

		if ( isStrict ) {
			return path === itemPath;
		}

		return path.indexOf( itemPath ) === 0;
	}

	render() {
		return (
			<Sidebar>
				<a href="/devdocs">
					<h1 className="devdocs__title">Calypso Docs</h1>
				</a>
				<SidebarMenu>
					<ul>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="search"
							label="Search"
							link="/devdocs"
							selected={ this.isItemSelected( '/devdocs' ) }
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="location"
							label="The Calypso Guide"
							link="/devdocs/docs/guide/index.md"
							selected={ this.isItemSelected( '/devdocs/docs/guide', false ) }
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="pencil"
							label="Contributing"
							link="/devdocs/.github/CONTRIBUTING.md"
							selected={ this.isItemSelected( '/devdocs/.github/CONTRIBUTING.md' ) }
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="heading"
							label="Typography"
							link="/devdocs/typography"
							selected={ this.isItemSelected( '/devdocs/typography' ) }
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="types"
							label="Icons"
							link="/devdocs/icons"
							selected={ this.isItemSelected( '/devdocs/icons' ) }
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="plugins"
							label="State Selectors"
							link="/devdocs/selectors"
							selected={ this.isItemSelected( '/devdocs/selectors', false ) }
						/>
					</ul>
				</SidebarMenu>
				<SidebarHeading>Component Library</SidebarHeading>
				<SidebarMenu>
					<ul>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="layout-blocks"
							label="All Components"
							link="/devdocs/design"
							selected={ this.isItemSelected( '/devdocs/design', false ) }
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="custom-post-type"
							label="Blocks"
							link="/devdocs/blocks"
							selected={ this.isItemSelected( '/devdocs/blocks', false ) }
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="bookmark"
							label="Banners and Notices"
							link="/devdocs/components/banners"
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="grid"
							label="Buttons"
							link="/devdocs/design"
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="aside"
							label="Cards"
							link="/devdocs/design"
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="nametag"
							label="Form Elements"
							link="/devdocs/design"
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="heading"
							label="Headers"
							link="/devdocs/design"
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="my-sites"
							label="Icons and Logos"
							link="/devdocs/design"
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="pages"
							label="Navigation"
							link="/devdocs/design"
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="info"
							label="Popovers and Tooltips"
							link="/devdocs/design"
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="list-ordered"
							label="Progress"
							link="/devdocs/design"
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="image"
							label="Text and Images"
							link="/devdocs/components/text"
							selected={ this.isItemSelected( '/devdocs/components/text', false ) }
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="cog"
							label="Tools"
							link="/devdocs/design"
						/>
					</ul>
				</SidebarMenu>
			</Sidebar>
		);
	}
}
