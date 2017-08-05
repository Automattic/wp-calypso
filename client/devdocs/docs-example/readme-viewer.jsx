/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { Parser } from 'html-to-react';
const htmlToReactParser = new Parser();

/**
 * Internal Dependencies
 */
import FoldableCard from 'components/foldable-card';

class ReadmeViewer extends Component {
	static propTypes = {
		getReadme: PropTypes.func,
		readmeFilePath: PropTypes.string
	};

	constructor( props ) {
		super( props );
	}

	render() {
		const readmeFilePath = this.props.readmeFilePath;
		const readme = readmeFilePath && this.props.getReadme( readmeFilePath );
		const editLink = <div className="docs-example__readme-viewer-edit-link">
			<a
				href={ `https://github.com/Automattic/wp-calypso/edit/master/client/components/${ readmeFilePath }/README.md`}
			>
				Improve this document on GitHub
			</a>
		</div>;
		return (
			<div className="docs-example__readme-viewer">
				<hr className="docs-example__readme-viewer-hr" />
				<FoldableCard
					header=""
					clickableHeader={ true }
					compact={ true }
					expanded={ true }
					summary="README.md"
					disabled={ ! readme }
				>
					{ readme && editLink }
					{ readme || <div className="docs-example__readme-viewer-not-available">README.md is not available.</div> }
				</FoldableCard>
			</div>
		);
	}
}

ReadmeViewer.defaultProps = {
	getReadme: ( readmeFilePath ) => {
		return htmlToReactParser.parse(
			require( `../../components/${ readmeFilePath }/README.md` ) );
	}
};

export default ReadmeViewer;
