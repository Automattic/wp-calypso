/** @format */

/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Collection from 'devdocs/design/search-collection';
import DocumentHead from 'components/data/document-head';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import ReadmeViewer from 'components/readme-viewer';
import { slugToCamelCase } from 'devdocs/docs-example/util';

/**
 * Docs examples
 */
import Button from 'gutenberg-blocks/button/docs/example';
import page from 'page';

export default class extends React.Component {
	state = { filter: '' };

	backToAll = () => {
		page( '/devdocs/gutenberg-blocks/' );
	};

	render() {
		const { component } = this.props;
		const { filter } = this.state;

		const className = classnames( 'devdocs', 'devdocs__gutenberg-blocks', {
			'is-single': component,
			'is-list': ! component,
		} );

		return (
			<Main className={ className }>
				<DocumentHead title="Gutenberg Blocks" />

				{ component ? (
					<HeaderCake onClick={ this.backToAll } backText="All Components">
						{ slugToCamelCase( component ) }
					</HeaderCake>
				) : (
					<div>
						<ReadmeViewer readmeFilePath="/client/devdocs/gutenberg-blocks/README.md" />
					</div>
				) }

				<Collection component={ component } filter={ filter } section="gutenberg-blocks">
					<Button readmeFilePath="button" />
				</Collection>
			</Main>
		);
	}
}
