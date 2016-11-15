/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Sidebar from 'layout/sidebar';
import SidebarHeading from 'layout/sidebar/heading';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarItem from 'layout/sidebar/item';

export default React.createClass( {

	displayName: 'DevdocsSidebar',

	mixins: [ PureRenderMixin ],

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
							selected={ '/devdocs' === this.props.path }
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="location"
							label="The Calypso Guide"
							link="/devdocs/docs/guide/index.md"
							selected={ '/devdocs/docs/guide/index.md' === this.props.path }
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="pencil"
							label="Contributing"
							link="/devdocs/.github/CONTRIBUTING.md"
							selected={ '/devdocs/.github/CONTRIBUTING.md' === this.props.path }
						/>
					</ul>
				</SidebarMenu>
				<SidebarHeading>Live Docs</SidebarHeading>
				<SidebarMenu>
					<ul>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="layout-blocks"
							label="UI Components"
							link="/devdocs/design"
							selected={ '/devdocs/design' === this.props.path }
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="custom-post-type"
							label="Blocks"
							link="/devdocs/blocks"
							selected={ '/devdocs/blocks' === this.props.path }
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="plugins"
							label="State Selectors"
							link="/devdocs/selectors"
							selected={ 0 === this.props.path.indexOf( '/devdocs/selectors' ) }
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="heading"
							label="Typography"
							link="/devdocs/design/typography"
							selected={ '/devdocs/design/typography' === this.props.path }
						/>
						<SidebarItem
							className="devdocs__navigation-item"
							icon="types"
							label="Icons"
							link="/devdocs/docs/icons.md"
							selected={ '/devdocs/docs/icons.md' === this.props.path }
						/>
					</ul>
				</SidebarMenu>
			</Sidebar>
		);
	}
} );
