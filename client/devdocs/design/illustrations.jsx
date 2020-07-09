/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';

export default class Illustration extends React.PureComponent {
	static displayName = 'Illustrations';

	render() {
		return (
			<Main className="devdocs design__illustrations devdocs__illustrations">
				<DocumentHead title="Illustrations" />

				<div className="design__illustrations-content devdocs__doc-content">
					<h1>Illustrations</h1>

					<h2>Interface Typography</h2>
					<p>
						We use sans-serif system fonts with weights of 400 or greater as the default for UI.
						This includes UI elements like buttons, notices, and navigation. System fonts improve
						the page-rendering speed.
					</p>
				</div>
			</Main>
		);
	}
}
