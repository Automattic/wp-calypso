/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import DocsSelectorsSearch from './search';
import DocsSelectorsSingle from './single';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';

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
