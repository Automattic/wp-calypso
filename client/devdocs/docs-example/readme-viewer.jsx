/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';

/**
 * Internal Dependencies
 */
import FoldableCard from 'components/foldable-card';

class ReadmeViewer extends Component {
	static propTypes = {
		getReadmeHTML: PropTypes.func,
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

		const body = this.props.readmeFilePath
			? <div dangerouslySetInnerHTML={ this.props.getReadmeHTML() } />
			: <div>Please write one!</div>;

		return (
			<div className="docs-example__readme-viewer">
				<hr className="docs-example__readme-viewer-hr"/>
				<FoldableCard header={ header } clickableHeader={ true } compact={ true }>
					{ body }
				</FoldableCard>
			</div>
		);
	}
}

ReadmeViewer.defaultProps = {
	getReadmeHTML: () => { __html: require( `../../${ this.props.readmeFilePath }/README.md` ) }
};

export default ReadmeViewer;