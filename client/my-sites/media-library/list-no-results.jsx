/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';

/**
 * Internal dependencies
 */
import NoResults from 'my-sites/no-results';

module.exports = React.createClass( {
	displayName: 'MediaLibraryListNoResults',

	propTypes: {
		filter: PropTypes.string,
		search: PropTypes.string
	},

	getDefaultProps: function() {
		return {
			search: ''
		};
	},

	getLabel: function() {
		var label;

		switch ( this.props.filter ) {
			case 'images':
				label = this.translate( 'No images match your search for {{searchTerm/}}.', {
					components: {
						searchTerm: <em>{ this.props.search }</em>
					},
					context: 'Media no search results'
				} );
				break;
			case 'videos':
				label = this.translate( 'No videos match your search for {{searchTerm/}}.', {
					components: {
						searchTerm: <em>{ this.props.search }</em>
					},
					context: 'Media no search results'
				} );
				break;
			case 'audio':
				label = this.translate( 'No audio files match your search for {{searchTerm/}}.', {
					components: {
						searchTerm: <em>{ this.props.search }</em>
					},
					context: 'Media no search results'
				} );
				break;
			case 'documents':
				label = this.translate( 'No documents match your search for {{searchTerm/}}.', {
					components: {
						searchTerm: <em>{ this.props.search }</em>
					},
					context: 'Media no search results'
				} );
				break;
			default:
				label = this.translate( 'No media files match your search for {{searchTerm/}}.', {
					components: {
						searchTerm: <em>{ this.props.search }</em>
					},
					context: 'Media no search results'
				} );
				break;
		}

		return label;
	},

	render: function() {
		return (
			<NoResults
				text={ this.getLabel() }
				image="/calypso/images/pages/illustration-pages.svg" />
		);
	}
} );
