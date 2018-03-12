/** @format */

/**
 * External Dependencies
 */

import React, { Component } from 'react';
import { Parser } from 'html-to-react';
import PropTypes from 'prop-types';

const htmlToReactParser = new Parser();

/**
 * Internal Dependencies
 */
import FoldableCard from 'components/foldable-card';

class ReadmeViewer extends Component {
	static propTypes = {
		getReadme: PropTypes.func,
		readmeFilePath: PropTypes.string,
		section: PropTypes.string,
	};

	static defaultProps = {
		getReadme: ( section, readmeFilePath ) => {
			if ( section === 'blocks' ) {
				return htmlToReactParser.parse( require( `../../blocks/${ readmeFilePath }/README.md` ) );
			}
			return htmlToReactParser.parse( require( `../../components/${ readmeFilePath }/README.md` ) );
		},
	};

	render() {
		const { section, readmeFilePath } = this.props;
		const readme = readmeFilePath && this.props.getReadme( section, readmeFilePath );
		const editLink = (
			<div className="docs-example__readme-viewer-edit-link">
				<a
					href={ `https://github.com/Automattic/wp-calypso/edit/master/client/${ section }/${ readmeFilePath }/README.md` }
				>
					Improve this document on GitHub
				</a>
			</div>
		);
		return (
			<div className="docs-example__readme-viewer">
				<hr className="docs-example__readme-viewer-hr" />
				<FoldableCard
					header="README.md"
					clickableHeader={ true }
					compact={ true }
					expanded={ true }
					summary="README.md"
					disabled={ ! readme }
				>
					{ readme && editLink }
					{ readme || (
						<div className="docs-example__readme-viewer-not-available">
							README.md is not available.
						</div>
					) }
				</FoldableCard>
			</div>
		);
	}
}

export default ReadmeViewer;
