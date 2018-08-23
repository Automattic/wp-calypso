/** @format */

/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { registerCoreBlocks } from '@wordpress/block-library';
import page from 'page';
import { trim } from 'lodash';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import ReadmeViewer from 'components/readme-viewer';
import { slugToCamelCase } from '../docs-example/util';
import HeaderCake from 'components/header-cake';
import SearchCard from 'components/search-card';
import Collection from 'devdocs/design/search-collection';
import { GutenbergBlockExample, generateExample } from './example';
import examples from './examples';

registerCoreBlocks();

export default class GutenbergBlocks extends React.Component {
	state = { filter: '' };

	backToAll = () => {
		page( '/devdocs/gutenberg-blocks/' );
	};

	onSearch = term => {
		this.setState( { filter: trim( term || '' ).toLowerCase() } );
	};

	render() {
		const { block } = this.props;
		const { filter } = this.state;

		const className = classnames( 'devdocs', 'devdocs__gutenberg-blocks', {
			'is-single': block,
			'is-list': ! block,
		} );

		return (
			<Main className={ className }>
				<DocumentHead title="Gutenberg Blocks" />

				{ block ? (
					<HeaderCake onClick={ this.backToAll } backText="All Blocks">
						{ slugToCamelCase( block ) }
					</HeaderCake>
				) : (
					<div>
						<ReadmeViewer readmeFilePath="/client/devdocs/gutenberg-blocks/README.md" />
						<SearchCard
							onSearch={ this.onSearch }
							initialValue={ filter }
							placeholder="Search Gutenberg blocks…"
							analyticsGroup="Docs"
						/>
					</div>
				) }

				<Collection component={ block } filter={ filter } section="gutenberg-blocks">
					{ examples.map( example => {
						const exampleCode = generateExample( example );
						return (
							<GutenbergBlockExample
								key={ example.name }
								asyncName={ example.name }
								name={ example.name }
								attributes={ example.attributes }
								inner={ example.inner }
								exampleCode={ exampleCode }
							/>
						);
					} ) }
				</Collection>
			</Main>
		);
	}
}
