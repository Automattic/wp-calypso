/**
 * External dependencies
 */
import React from 'react/addons';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

export default React.createClass( {

	displayName: 'DevdocsSidebar',

	mixins: [ React.addons.PureRenderMixin ],

	render() {
		return (
			<div className="wpcom-sidebar sidebar devdocs__sidebar">
				<h1 className="devdocs__title">Calypso Docs</h1>
				<ul className="sidebar-menu">
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
				<h2 className="sidebar-heading">Live Docs</h2>
				<ul className="sidebar-menu">
					<li className="devdocs__navigation-item">
						<Gridicon icon="layout-blocks" />
						<a className="devdocs__sidebar-item" href="/devdocs/design">
							UI Components
						</a>
					</li>
					<li className="devdocs__navigation-item">
						<Gridicon icon="types" />
						<a className="devdocs__sidebar-item" href="/devdocs/docs/icons.md">
							Icons
						</a>
					</li>
				</ul>
			</div>
		);
	}
} );
