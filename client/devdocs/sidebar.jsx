/**
 * External dependencies
 */
import React from 'react/addons';

/**
 * Internal dependencies
 */


export default React.createClass( {

	displayName: 'DevdocsSidebar',

	mixins: [ React.addons.PureRenderMixin ],

	render() {
		return (
			<div className="wpcom-sidebar sidebar devdocs__sidebar">
				<h1 className="devdocs__title">Calypso Docs</h1>
				<ul className="devdocs__navigation">
					<li className="devdocs__navigation-item">
						<a className="devdocs__sidebar-item" href="/devdocs">
							Home
						</a>
					</li>
					<li className="devdocs__navigation-item">
						<a className="devdocs__sidebar-item" href="/devdocs/docs/guide/index.md">
							The Calypso Guide
						</a>
					</li>
					<li className="devdocs__navigation-item">
						<a className="devdocs__sidebar-item" href="/devdocs/design">
							UI Components
						</a>
					</li>
					<li className="devdocs__navigation-item">
						<a className="devdocs__sidebar-item" href="/devdocs/docs/icons.md">
							Icons
						</a>
					</li>
					<li className="devdocs__navigation-item">
						<a className="devdocs__sidebar-item" href="/devdocs/CONTRIBUTING.md">
							Contributing
						</a>
					</li>
				</ul>
			</div>
		);
	}
} );
