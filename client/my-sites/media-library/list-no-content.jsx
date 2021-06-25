/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'calypso/components/empty-content';
import UploadButton from './upload-button';
import { userCan } from 'calypso/lib/site/utils';

/**
 * Image dependencies
 */
import mediaImage from 'calypso/assets/images/illustrations/media.svg';

class MediaLibraryListNoContent extends Component {
	static propTypes = {
		site: PropTypes.object,
		filter: PropTypes.string,
		source: PropTypes.string,
	};

	getLabel() {
		const { filter, source, translate } = this.props;

		//TODO: handle each service with individual messages
		if ( 'google_photos' === source ) {
			return translate( "You don't have any photos in your Google library.", {
				comment: 'Media no results',
			} );
		}

		if ( 'pexels' === source ) {
			return translate( 'Use the search above to find free photos!', {
				comment: 'Media no results',
			} );
		}

		switch ( filter ) {
			case 'this-post':
				return translate( 'There are no media items uploaded to this post.', {
					comment: 'Media no results',
				} );

			case 'images':
				return translate( "You don't have any images.", {
					comment: 'Media no results',
				} );

			case 'videos':
				return translate( "You don't have any videos.", {
					comment: 'Media no results',
				} );

			case 'audio':
				return translate( "You don't have any audio files.", {
					comment: 'Media no results',
				} );

			case 'documents':
				return translate( "You don't have any documents.", {
					comment: 'Media no results',
				} );

			default:
				return translate( "You don't have any media.", {
					comment: 'Media no results',
				} );
		}
	}

	render() {
		let line = '';
		let action = '';

		if ( userCan( 'upload_files', this.props.site ) && ! this.props.source ) {
			line = this.props.translate( 'Would you like to upload something?' );
			action = (
				<UploadButton
					className="media-library__no-content-upload-button is-primary"
					site={ this.props.site }
				>
					{ this.props.translate( 'Upload media' ) }
				</UploadButton>
			);
		} else if ( 'google_photos' === this.props.source ) {
			line = this.props.translate( 'New photos may take a few minutes to appear.' );
		}

		return (
			<EmptyContent
				title={ this.getLabel() }
				line={ line }
				action={ action }
				illustration={ mediaImage }
				illustrationWidth={ 150 }
			/>
		);
	}
}

export default localize( MediaLibraryListNoContent );
