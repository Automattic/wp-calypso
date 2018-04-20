/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import Main from 'components/main';
import DocsSelectorsSingle from './single';
import DocsSelectorsSearch from './search';
import DocumentHead from 'components/data/document-head';

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
				<Card>
					<CardHeading>State Selectors</CardHeading>

					<p>
						A selector is simply a convenience function for retrieving data out of the global state
						tree. This page contains all available state selectors, which can be used as a helper in
						retrieving derived data from the global state tree.
					</p>

					<p>
						To learn more about selectors, refer to the{' '}
						<a href="https://github.com/Automattic/wp-calypso/blob/master/docs/our-approach-to-data.md#selectors">
							Our Approach to Data" document
						</a>.
					</p>
				</Card>
				{ selector && <DocsSelectorsSingle { ...{ selector, search } } /> }
				{ ! selector && <DocsSelectorsSearch search={ search } /> }
			</Main>
		);
	}
}
