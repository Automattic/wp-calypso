/**
 * External dependencies
 */

import React from 'react';

export default class extends React.PureComponent {
	static displayName = 'Error';

	render() {
		return (
			<div className="devdocs__error devdocs__doc-content">
				<h1>Sorry, we can't find that page right now</h1>
				<img alt="WordPress" src="/calypso/images/illustrations/illustration-404.svg" />
				<p>
					Are we missing documentation? Could our docs be improved? Let us know by{ ' ' }
					<a href="/devdocs/.github/CONTRIBUTING.md">filing a GitHub issue</a>!
				</p>
			</div>
		);
	}
}
