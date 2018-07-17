/** @format */

/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import ReadmeViewer from 'components/readme-viewer';

export default class GutenbergBlocks extends React.Component {
	render() {
		const className = classnames( 'devdocs', 'devdocs__gutenberg-blocks' );

		return (
			<Main className={ className }>
				<DocumentHead title="Gutenberg Blocks" />
				<ReadmeViewer readmeFilePath="/client/devdocs/gutenberg-blocks/README.md" />
			</Main>
		);
	}
}
