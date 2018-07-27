/** @format */

/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import page from 'page';
import { keys, trim } from 'lodash';

/**
 * Internal dependencies
 */
import Collection from 'devdocs/design/search-collection';
import DocumentHead from 'components/data/document-head';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import ReadmeViewer from 'components/readme-viewer';
import SearchCard from 'components/search-card';
import { camelCaseToSlug, slugToCamelCase } from 'devdocs/docs-example/util';
import * as examples from 'gutenberg-components/examples';

export default class extends React.Component {
	state = { filter: '' };

	backToAll = () => {
		page( '/devdocs/gutenberg-components/' );
	};

	onSearch = term => {
		this.setState( { filter: trim( term || '' ).toLowerCase() } );
	};

	render() {
		const { component } = this.props;
		const { filter } = this.state;

		const className = classnames( 'devdocs', 'devdocs__gutenberg-components', {
			'is-single': component,
			'is-list': ! component,
		} );

		return (
			<Main className={ className }>
				<DocumentHead title="Gutenberg Components" />

				{ component ? (
					<HeaderCake onClick={ this.backToAll } backText="All Components">
						{ slugToCamelCase( component ) }
					</HeaderCake>
				) : (
					<div>
						<ReadmeViewer readmeFilePath="/client/devdocs/gutenberg-components/README.md" />
						<SearchCard
							onSearch={ this.onSearch }
							initialValue={ filter }
							placeholder="Search Gutenberg components…"
							analyticsGroup="Docs"
						/>
					</div>
				) }

				<Collection component={ component } filter={ filter } section="gutenberg-components">
					{ keys( examples ).map( exampleName => {
						const Example = examples[ exampleName ];
						return (
							<Example key={ exampleName } readmeFilePath={ camelCaseToSlug( exampleName ) } />
						);
					} ) }
				</Collection>
			</Main>
		);
	}
}
