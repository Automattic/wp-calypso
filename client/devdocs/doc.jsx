/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import DocService from './service';
import Error from './error';
import DocumentHead from 'components/data/document-head';
import highlight from 'lib/highlight';

export default class extends React.Component {
	static displayName = 'SingleDocument';

	static propTypes = {
		path: PropTypes.string.isRequired,
		term: PropTypes.string,
		sectionId: PropTypes.string,
	};

	state = {
		body: '',
		error: null,
	};

	timeoutID = null;

	componentDidMount() {
		this.fetch();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.path !== prevProps.path ) {
			this.fetch();
		}
		if ( this.state.body ) {
			this.setBodyScrollPosition();
		}
	}

	componentWillUnmount() {
		this.clearLoadingMessage();
	}

	fetch = () => {
		this.setState( {
			body: '',
			error: null,
		} );
		this.delayLoadingMessage();
		DocService.fetch(
			this.props.path,
			function ( error, body ) {
				this.setState( {
					body,
					error,
				} );
			}.bind( this )
		);
	};

	setBodyScrollPosition = () => {
		if ( this.props.sectionId ) {
			const sectionNode = document.getElementById( this.props.sectionId );

			if ( sectionNode ) {
				sectionNode.scrollIntoView();
			}
		}
	};

	delayLoadingMessage = () => {
		this.clearLoadingMessage();
		this.timeoutID = setTimeout(
			function () {
				if ( ! this.state.body ) {
					this.setState( {
						body: 'Loading…',
					} );
				}
			}.bind( this ),
			1000
		);
	};

	clearLoadingMessage = () => {
		if ( 'number' === typeof this.timeoutID ) {
			window.clearTimeout( this.timeoutID );
			this.timeoutID = null;
		}
	};

	renderBody() {
		const editURL = encodeURI(
			'https://github.com/Automattic/wp-calypso/edit/master/' + this.props.path
		);
		const { body, error } = this.state;

		if ( ! body || error ) {
			return null;
		}

		return (
			<div className="devdocs__body">
				<a
					className="devdocs__doc-edit-link"
					href={ editURL }
					target="_blank"
					rel="noopener noreferrer"
				>
					Improve this document on GitHub
				</a>
				<div
					className="devdocs__doc-content"
					//eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={ { __html: highlight( this.props.term, body ) } }
				/>
			</div>
		);
	}

	render() {
		const { body, error } = this.state;
		const titleMatches = body && body.length && body.match( /<h1[^>]+>(.+)<\/h1>/ );
		const title = titleMatches && titleMatches[ 1 ];

		return (
			<div className="devdocs devdocs__doc">
				{ title ? <DocumentHead title={ title } /> : null }
				{ this.renderBody() }
				{ error && <Error /> }
			</div>
		);
	}
}
