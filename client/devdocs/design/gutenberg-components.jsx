/** @format */

/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import page from 'page';

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
import * as examples from 'gutenberg-components/examples';

export default class extends React.Component {
	state = { filter: '' };

	backToAll = () => {
		page( '/devdocs/gutenberg-components/' );
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
					<ReadmeViewer readmeFilePath="/client/devdocs/gutenberg-components/README.md" />
				) }

				<Collection component={ component } filter={ filter } section="gutenberg-components">
					<examples.Autocomplete readmeFilePath="autocomplete" />
					<examples.BaseControl readmeFilePath="base-control" />
					<examples.Button readmeFilePath="button" />
					<examples.ButtonGroup readmeFilePath="button-group" />
				</Collection>
			</Main>
		);
	}
}
