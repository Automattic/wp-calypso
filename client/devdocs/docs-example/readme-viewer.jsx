/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';

/**
 * Internal Dependencies
 */
import FoldableCard from 'components/foldable-card';

class ReadmeViewer extends Component {
	constructor( props ) {
		super( props );
	}

	getReadmeHTML() {
		return { __html: require( `../../${ this.props.readmeFilePath }/README.md` ) };
	}

	render() {
		const headerText = this.props.readmeFilePath
			? 'README.md'
			: "Oh no. There's no README.";
		const header = <span className="docs-example__readme-viewer-header">{ headerText } </span>;

		const body = this.props.readmeFilePath
			? <div dangerouslySetInnerHTML={ this.getReadmeHTML() } />
			: 'Please write one!';

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

export default ReadmeViewer;