/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PostActions from 'lib/posts/actions';
import * as stats from 'lib/posts/stats';
import { getFeaturedImageId } from 'lib/posts/utils';
import Accordion from 'components/accordion';
import EditorDrawerWell from 'post-editor/editor-drawer-well';
import FeaturedImage from 'post-editor/editor-featured-image';
import MediaActions from 'lib/media/actions';

import Dispatcher from 'dispatcher';
import { editPost } from 'state/posts/actions';

class EditorDrawerFeaturedImage extends Component {
	static propTypes = {
		site: PropTypes.object,
		post: PropTypes.object,
		translate: PropTypes.func
	};

	state = {};

	constructor( props ) {
		super( props );

		this.state = {
			isSelecting: false
		};
	}

	startSelecting = () => this.setState( { isSelecting: true } );
	endSelecting = () => this.setState( { isSelecting: false } );

	removeImage() {
		PostActions.edit( {
			featured_image: ''
		} );

		stats.recordStat( 'featured_image_removed' );
		stats.recordEvent( 'Featured image removed' );
	}

	onFilesDrop = ( files ) => {
		Dispatcher.register( ( payload ) => {
			const action = payload.action;

			switch ( action.type ) {
				case 'CREATE_MEDIA_ITEM':
					// called when the transient blob has been created and the upload starts
					break;
				case 'RECEIVE_MEDIA_ITEM':
					// called when the media file has been uploaded and needs to be refreshed from the server
					setTimeout( () => {
						PostActions.edit( {
							featured_image: action.data.ID
						} );
					}, 0 );
			}
		} );

		MediaActions.clearValidationErrors( this.props.site.ID );
		MediaActions.add( this.props.site.ID, files ).then();
	};

	render() {
		const { translate, site, post } = this.props;

		return (
			<Accordion title={ translate( 'Featured Image' ) }>
				<EditorDrawerWell
					label={ translate( 'Set Featured Image' ) }
					empty={ ! site || ! post || ! getFeaturedImageId( post ) }
					onClick={ this.startSelecting }
					onFileDrop={ this.onFilesDrop }
					onRemove={ this.removeImage }
				>
					<FeaturedImage
						selecting={ this.state.isSelecting }
						onImageSelected={ this.endSelecting }
						site={ site }
						post={ post }
					/>
				</EditorDrawerWell>
			</Accordion>
		);
	}
}

export default connect( null, {
	editPost
} )( localize( EditorDrawerFeaturedImage ) );
