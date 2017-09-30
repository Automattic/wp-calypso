/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import DocService from './service';
import DocumentHead from 'components/data/document-head';
import CompactCard from 'components/card/compact';
import highlight from 'lib/highlight';

export default class extends React.Component {
	static displayName = 'SingleDocument';

	static propTypes = {
		path: PropTypes.string.isRequired,
		term: PropTypes.string,
		sectionId: PropTypes.string
	};

	state = {
		body: ''
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
			body: ''
		} );
		this.delayLoadingMessage();
		DocService.fetch( this.props.path, function( err, body ) {
			this.setState( {
				body: ( err || body )
			} );
		}.bind( this ) );
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
		this.timeoutID = setTimeout( function() {
			if ( ! this.state.body ) {
				this.setState( {
					body: 'Loading…'
				} );
			}
		}.bind( this ), 1000 );
	};

	clearLoadingMessage = () => {
		if ( 'number' === typeof this.timeoutID ) {
			window.clearTimeout( this.timeoutID );
			this.timeoutID = null;
		}
	};

	render() {
		const editURL = encodeURI( 'https://github.com/Automattic/wp-calypso/edit/master/' + this.props.path ) +
			'?message=Documentation: <title>&description=What did you change and why&target_branch=update/docs-your-title';
		const titleMatches = this.state.body.length && this.state.body.match( /<h1[^>]+>(.+)<\/h1>/ );
		const title = titleMatches && titleMatches[ 1 ];

		return (
			<div className="devdocs devdocs__doc">
				{
					title
						? <DocumentHead title={ title } />
						: null

				}
				<CompactCard className="devdocs__doc-header">
					Path: <code>{ this.props.path }</code>
					<a href={ editURL } target="_blank" rel="noopener noreferrer">Improve this document on GitHub &rarr;</a>
				</CompactCard>
				<div
					className="devdocs__doc-content"
					ref="body"
					dangerouslySetInnerHTML={ //eslint-disable-line react/no-danger
						{ __html: highlight( this.props.term, this.state.body ) }
					}
				/>
			</div>
		);
	}
}
