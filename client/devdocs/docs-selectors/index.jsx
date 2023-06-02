import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import ReadmeViewer from 'calypso/components/readme-viewer';
import DocsSelectorsSearch from './search';
import DocsSelectorsSingle from './single';

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
