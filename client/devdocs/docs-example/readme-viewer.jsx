/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';

/**
 * Internal Dependencies
 */
import FoldableCard from 'components/foldable-card';
import SectionHeader from 'components/section-header';

class ReadmeViewer extends Component {
	static propTypes = {
		readmeFilePath: PropTypes.string.isRequired
	};

	constructor( props ) {
		super( props );
	}

	getReadmeHTML() {
		return { __html: require( `../../${ this.props.readmeFilePath }/README.md` ) };
	}

	render() {
		return (
			<FoldableCard header="README" clickableHeader={ true }>
				<div dangerouslySetInnerHTML={ this.getReadmeHTML() } />
			</FoldableCard>
		);
	}
}

export default ReadmeViewer;