/**
 * External dependencies
 */
import React, { PureComponent, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import DocsSelectorsSingle from './single';
import DocsSelectorsSearch from './search';

export default class DocsSelectors extends PureComponent {
	static propTypes = {
		selector: PropTypes.string,
		search: PropTypes.string
	};

	render() {
		const { search, selector } = this.props;

		return (
			<Main className="devdocs docs-selectors">
				<DocumentHead title="State Selectors" />
				{ selector && <DocsSelectorsSingle { ...{ selector, search } } /> }
				{ ! selector && <DocsSelectorsSearch search={ search } /> }
			</Main>
		);
	}
}
