/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import UploadButton from './upload-button';
import EmptyContent from 'components/empty-content';
import { userCan } from 'lib/site/utils';

class MediaLibraryListNoContent extends Component {
	static propTypes = {
		site: PropTypes.object,
		filter: PropTypes.string,
		source: PropTypes.string,
	};

	getLabel() {
		const {
			filter,
			source,
			translate,
		} = this.props;

		//TODO: handle each service with individual messages
		if ( 'google_photos' === source ) {
			return translate( 'You don\'t have any photos in your Google library.', {
				comment: 'Media no results'
			} );
		}

		switch ( filter ) {
			case 'this-post':
				return translate( 'There are no media items uploaded to this post.', {
					comment: 'Media no results'
				} );

			case 'images':
				return translate( 'You don\'t have any images.', {
					comment: 'Media no results'
				} );

			case 'videos':
				return translate( 'You don\'t have any videos.', {
					comment: 'Media no results'
				} );

			case 'audio':
				return translate( 'You don\'t have any audio files.', {
					comment: 'Media no results'
				} );

			case 'documents':
				return translate( 'You don\'t have any documents.', {
					comment: 'Media no results'
				} );

			default:
				return translate( 'You don\'t have any media.', {
					comment: 'Media no results'
				} );
		}
	}

	render() {
		let line = '', action = '';

		if ( userCan( 'upload_files', this.props.site ) && ! this.props.source ) {
			line = this.props.translate( 'Would you like to upload something?' );
			action = (
				<UploadButton className="button is-primary" site={ this.props.site }>
					{ this.props.translate( 'Upload Media' ) }
				</UploadButton>
			);
		} else if ( this.props.source ) {
			line = this.props.translate( 'New photos may take a few minutes to appear.' );
		}

		return (
			<EmptyContent
				title={ this.getLabel() }
				line={ line }
				action={ action }
				illustration={ '/calypso/images/media/illustration-media.svg' }
				illustrationWidth={ 150 }
			/>
		);
	}
}

export default localize( MediaLibraryListNoContent );
