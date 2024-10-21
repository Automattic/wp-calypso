import config from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import mediaImage from 'calypso/assets/images/illustrations/media.svg';
import EmptyContent from 'calypso/components/empty-content';
import { userCan } from 'calypso/lib/site/utils';
import UploadButton from './upload-button';

class MediaLibraryListNoContent extends Component {
	static propTypes = {
		site: PropTypes.object,
		filter: PropTypes.string,
		source: PropTypes.string,
		onSourceChange: PropTypes.func,
	};

	changeSource = () => this.props.onSourceChange( 'pexels' );

	getLabel() {
		const { filter, source, translate } = this.props;

		//TODO: handle each service with individual messages
		if ( 'google_photos_picker' === source ) {
			if ( 'videos' === filter ) {
				return translate( "You don't have any videos in your Google Photos library.", {
					comment: 'Media no results',
				} );
			}
			return translate( "You don't have any images in your Google Photos library.", {
				comment: 'Media no results',
			} );
		}

		if ( 'pexels' === source || 'openverse' === source ) {
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
		const showFreeLibraryButton =
			config.isEnabled( 'external-media/free-photo-library' ) &&
			userCan( 'upload_files', this.props.site ) &&
			! this.props.source &&
			( 'images' === this.props.filter || 'undefined' === typeof this.props.filter ); // Filter to where we would allow selecting an image.

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
		} else if ( 'google_photos_picker' === this.props.source ) {
			line = this.props.translate( 'New images and videos may take a few minutes to appear.' );
		}

		return (
			<EmptyContent
				title={ this.getLabel() }
				line={ line }
				action={ action }
				secondaryAction={ showFreeLibraryButton && this.props.translate( 'Browse free images' ) }
				secondaryActionCallback={ this.changeSource }
				illustration={ mediaImage }
				illustrationWidth={ 150 }
			/>
		);
	}
}

export default localize( MediaLibraryListNoContent );
