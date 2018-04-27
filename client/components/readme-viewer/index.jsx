/** @format */

/**
 * External Dependencies
 */

import React, { Component } from 'react';
import { Parser } from 'html-to-react';
import PropTypes from 'prop-types';
import request from 'superagent';

const htmlToReactParser = new Parser();

/**
 * Internal Dependencies
 */

class ReadmeViewer extends Component {
	static propTypes = {
		readmeFilePath: PropTypes.string,
	};

	state = {
		readme: null,
	};

	componentDidMount() {
		const { readmeFilePath } = this.props;
		request
			.get( '/devdocs/service/content' )
			.query( { path: readmeFilePath } )
			.then( ( { text } ) => {
				this.setState( {
					readme: htmlToReactParser.parse( text ),
				} );
			} );
	}

	render() {
		const { readmeFilePath } = this.props;
		const editLink = (
			<a
				className="readme-viewer__doc-edit-link devdocs__doc-edit-link"
				href={ `https://github.com/Automattic/wp-calypso/edit/master${ readmeFilePath }` }
			>
				Improve this document on GitHub
			</a>
		);

		return this.props.readmeFilePath ? (
			<div className="readme-viewer__wrapper devdocs__doc-content">
				{ this.state.readme && editLink }
				{ this.state.readme || (
					<div className="readme-viewer__not-available">No documentation available.</div>
				) }
			</div>
		) : null;
	}
}

export default ReadmeViewer;
