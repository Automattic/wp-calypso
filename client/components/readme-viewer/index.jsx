/**
 * External Dependencies
 */
import React, { Component } from 'react';
import { Parser } from 'html-to-react';
import PropTypes from 'prop-types';

/**
 * Style Dependencies
 */
import './style.scss';

const htmlToReactParser = new Parser();

export default class ReadmeViewer extends Component {
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

	makeRequest = async () => {
		const { readmeFilePath } = this.props;

		try {
			const res = await fetch( `/devdocs/service/content?path=${ readmeFilePath }` );
			if ( res.ok ) {
				const text = await res.text();
				this.setState( { readme: htmlToReactParser.parse( text ) } );
			}
		} catch ( err ) {
			// Do nothing.
		}
	};

	componentDidMount() {
		this.makeRequest();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.readmeFilePath !== this.props.readmeFilePath ) {
			this.makeRequest();
		}
	}

	render() {
		const { readmeFilePath, showEditLink } = this.props;
		const editLink = (
			<a
				className="readme-viewer__doc-edit-link devdocs__doc-edit-link"
				href={ `https://github.com/Automattic/wp-calypso/edit/trunk${ readmeFilePath }` }
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
