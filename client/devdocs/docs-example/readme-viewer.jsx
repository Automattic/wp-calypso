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

class ReadmeViewer extends Component {
	static propTypes = {
		getReadme: PropTypes.func,
		readmeFilePath: PropTypes.string,
	};

	static defaultProps = {
		getReadme: readmeFilePath => {
			return htmlToReactParser.parse( require( `../../components/${ readmeFilePath }/README.md` ) );
		},
	};

	render() {
		const readmeFilePath = this.props.readmeFilePath;
		const readme = readmeFilePath && this.props.getReadme( readmeFilePath );
		const editLink = (
			<a
				className="docs-example__doc-edit-link"
				href={ `https://github.com/Automattic/wp-calypso/edit/master/client/components/${ readmeFilePath }/README.md` }
			>
				Improve this document on GitHub
			</a>
		);
		return (
			<div>
				{ readme && editLink }
				<div className="docs-example__readme-viewer">
					{ readme || (
						<div className="docs-example__readme-viewer-not-available">
							No documentation available.
						</div>
					) }
				</div>
			</div>
		);
	}
}

export default ReadmeViewer;
