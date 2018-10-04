/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import DocsSelectorsSingle from './single';
import DocsSelectorsSearch from './search';
import DocumentHead from 'components/data/document-head';
import ReadmeViewer from 'components/readme-viewer';

export default class DocsSelectors extends PureComponent {
	static propTypes = {
		selector: PropTypes.string,
		search: PropTypes.string,
	};

	render() {
		const { search, selector } = this.props;

		return (
			<Main className="devdocs docs-selectors">
				<DocumentHead title="State Selectors" />
				{ selector ? (
					<DocsSelectorsSingle { ...{ selector, search } } />
				) : (
					<div>
						<ReadmeViewer readmeFilePath="/client/devdocs/docs-selectors/README.md" />
						<DocsSelectorsSearch search={ search } />
					</div>
				) }
			</Main>
		);
	}
}
