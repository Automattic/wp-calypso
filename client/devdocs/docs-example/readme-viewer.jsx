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
		const header = this.props.readmeFilePath
			? <span id="docs-example__readme-present-header" className="docs-example__readme-viewer-header">
					README.md
				</span>
			: <span id="docs-example__readme-not-present-header" className="docs-example__readme-viewer-header">
					Oh no. There's no README.
				</span>;

		const readme = this.props.readmeFilePath && this.props.getReadme( this.props.readmeFilePath );

		return (
			<div className="docs-example__readme-viewer">
				<hr className="docs-example__readme-viewer-hr" />
				<FoldableCard header={ header } clickableHeader={ true } compact={ true }>
					{ readme || 'Please write one!' }
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
