/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import UploadButton from './upload-button';
import { userCan } from 'lib/site/utils';

export default React.createClass( {
	displayName: 'MediaLibraryListNoContent',

	propTypes: {
		site: React.PropTypes.object,
		filter: React.PropTypes.string
	},

	getLabel() {
		switch ( this.props.filter ) {
			case 'images':
				return this.translate( 'You don\'t have any images.', {
					textOnly: true,
					context: 'Media no results'
				} );

			case 'videos':
				return this.translate( 'You don\'t have any videos.', {
					textOnly: true,
					context: 'Media no results'
				} );

			case 'audio':
				return this.translate( 'You don\'t have any audio files.', {
					textOnly: true,
					context: 'Media no results'
				} );

			case 'documents':
				return this.translate( 'You don\'t have any documents.', {
					textOnly: true,
					context: 'Media no results'
				} );

			default:
				return this.translate( 'You don\'t have any media.', {
					textOnly: true,
					context: 'Media no results'
				} );
		}
	},

	render() {
		let line, action;
		if ( userCan( 'upload_files', this.props.site ) ) {
			line = this.translate( 'Would you like to upload something?' );
			action = (
				<UploadButton className="button is-primary" site={ this.props.site }>
					{ this.translate( 'Upload Media' ) }
				</UploadButton>
			);
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
} );
