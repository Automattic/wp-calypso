/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import Illustration from 'components/illustration';

export default class Illustrations extends React.PureComponent {
	static displayName = 'Illustrations';

	render() {
		return (
			<Main className="devdocs design__illustrations devdocs__illustrations">
				<DocumentHead title="Illustrations" />

				<div className="design__illustrations-content devdocs__doc-content">
					<h1>Illustrations</h1>

					<table className="design__illustrations-table">
						<tbody>
							<tr>
								<td>
									<Illustration path="adwords-google.svg" />
								</td>
								<td>
									<Illustration path="app-banner-editor.svg" />
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</Main>
		);
	}
}
