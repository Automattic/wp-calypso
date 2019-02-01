/** @format */

/**
 * External Dependencies
 */

import React, { Component } from 'react';
import { Parser } from 'html-to-react';
import PropTypes from 'prop-types';
import request from 'superagent';

/**
 * Style Dependencies
 */
import './style.scss';

const htmlToReactParser = new Parser();

class ReadmeViewer extends Component {
	static propTypes = {
		readmeFilePath: PropTypes.string,
		showEditLink: PropTypes.bool,
	};

	static defaultProps = {
		showEditLink: true,
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
		const { readmeFilePath, showEditLink } = this.props;
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
				{ this.state.readme && showEditLink && editLink }
				{ this.state.readme || (
					<div className="readme-viewer__not-available">No documentation available.</div>
				) }
			</div>
		) : null;
	}
}

export default ReadmeViewer;
