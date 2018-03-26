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
			<a
				className="docs-example__doc-edit-link"
				href={ `https://github.com/Automattic/wp-calypso/edit/master/client/${
					section === 'blocks' ? 'blocks' : 'components'
				}/${ readmeFilePath }/README.md` }
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
