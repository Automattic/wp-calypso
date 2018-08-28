/** @format */

/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import page from 'page';
import { get, trim } from 'lodash';

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
import GutenbergComponentExample from './example';
import examples from './examples.json';

const getExampleData = ( example ) => {
	const componentName = get( example, 'component' );
	const readmeFilePath = get( example, 'readmeFilePath', camelCaseToSlug( componentName ) );
	const render = get( example, 'render', `My${ componentName }` );

	return {
		componentName,
		readmeFilePath,
		render,
	};
};

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
					{ examples.map( example => {
						const {
							componentName,
							readmeFilePath,
							render,
						} = getExampleData( example );
						return (
							<GutenbergComponentExample
								key={ componentName }
								asyncName={ componentName }
								component={ componentName }
								readmeFilePath={ readmeFilePath }
								render={ render }
							/>
						);
					} ) }
				</Collection>
			</Main>
		);
	}
}
