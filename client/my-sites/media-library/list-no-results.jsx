/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import NoResults from 'calypso/my-sites/no-results';

class MediaLibraryListNoResults extends React.Component {
	static displayName = 'MediaLibraryListNoResults';

	static propTypes = {
		filter: PropTypes.string,
		search: PropTypes.string,
	};

	static defaultProps = {
		search: '',
	};

	getLabel = () => {
		let label;

		switch ( this.props.filter ) {
			case 'images':
				label = this.props.translate( 'No images match your search for {{searchTerm/}}.', {
					components: {
						searchTerm: <em>{ this.props.search }</em>,
					},
					context: 'Media no search results',
				} );
				break;
			case 'videos':
				label = this.props.translate( 'No videos match your search for {{searchTerm/}}.', {
					components: {
						searchTerm: <em>{ this.props.search }</em>,
					},
					context: 'Media no search results',
				} );
				break;
			case 'audio':
				label = this.props.translate( 'No audio files match your search for {{searchTerm/}}.', {
					components: {
						searchTerm: <em>{ this.props.search }</em>,
					},
					context: 'Media no search results',
				} );
				break;
			case 'documents':
				label = this.props.translate( 'No documents match your search for {{searchTerm/}}.', {
					components: {
						searchTerm: <em>{ this.props.search }</em>,
					},
					context: 'Media no search results',
				} );
				break;
			default:
				label = this.props.translate( 'No media files match your search for {{searchTerm/}}.', {
					components: {
						searchTerm: <em>{ this.props.search }</em>,
					},
					context: 'Media no search results',
				} );
				break;
		}

		return label;
	};

	render() {
		return (
			<NoResults text={ this.getLabel() } image="/calypso/images/pages/illustration-pages.svg" />
		);
	}
}

export default localize( MediaLibraryListNoResults );
