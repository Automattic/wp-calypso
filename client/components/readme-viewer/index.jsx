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
			return htmlToReactParser.parse( require( `../../${ readmeFilePath }` ) );
		},
	};

	render() {
		const { readmeFilePath } = this.props;
		const readme = readmeFilePath && this.props.getReadme( readmeFilePath );
		const editLink = (
			<a
				className="readme-viewer__doc-edit-link devdocs__doc-edit-link"
				href={ `https://github.com/Automattic/wp-calypso/edit/master/client/${ readmeFilePath }/README.md` }
			>
				Improve this document on GitHub
			</a>
		);
		return (
			<div>
				{ readme && editLink }
				<div className="devdocs__doc-content readme-viewer__wrapper">
					{ readme || (
						<div className="readme-viewer__not-available">No documentation available.</div>
					) }
				</div>
			</div>
		);
	}
}

export default ReadmeViewer;
