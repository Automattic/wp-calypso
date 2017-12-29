/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';
import { isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import MediaModal from 'post-editor/media-modal';
import MediaActions from 'lib/media/actions';
import PostActions from 'lib/posts/actions';
import { getFeaturedImageId } from 'lib/posts/utils';
import * as stats from 'lib/posts/stats';
import EditorFeaturedImagePreviewContainer from './preview-container';
import FeaturedImageDropZone from 'post-editor/editor-featured-image/dropzone';
import isDropZoneVisible from 'state/selectors/is-drop-zone-visible';
import Button from 'components/button';
import RemoveButton from 'components/remove-button';
import { getMediaItem } from 'state/selectors';
import QueryMedia from 'components/data/query-media';
import { localize } from 'i18n-calypso';
import { recordTracksEvent } from 'state/analytics/actions';

class EditorFeaturedImage extends Component {
	static propTypes = {
		featuredImage: PropTypes.object,
		hasDropZone: PropTypes.bool,
		isDropZoneVisible: PropTypes.bool,
		maxWidth: PropTypes.number,
		site: PropTypes.object,
		post: PropTypes.object,
		recordTracksEvent: PropTypes.func,
		selecting: PropTypes.bool,
		translate: PropTypes.func,
		onImageSelected: PropTypes.func,
	};

	static defaultProps = {
		hasDropZone: false,
		isDropZoneVisible: false,
		maxWidth: 450,
		onImageSelected: () => {},
	};

	state = {
		isSelecting: false,
	};

	showMediaModal = () => {
		const { featuredImage, site } = this.props;

		if ( featuredImage ) {
			MediaActions.setLibrarySelectedItems( site.ID, [ featuredImage ] );
		}

		this.setState( {
			isSelecting: true,
		} );
	};

	hideMediaModal = () => {
		this.setState( {
			isSelecting: false,
		} );
	};

	setImage = value => {
		this.hideMediaModal();
		this.props.onImageSelected();

		if ( ! value ) {
			return;
		}

		PostActions.edit( {
			featured_image: value.items[ 0 ].ID,
		} );

		stats.recordStat( 'featured_image_set' );
		stats.recordEvent( 'Featured image set' );

		this.props.recordTracksEvent( 'calypso_editor_featured_image_upload', {
			source: 'medialibrary',
			type: 'click',
		} );
	};

	static removeImage() {
		PostActions.edit( {
			featured_image: '',
		} );

		stats.recordStat( 'featured_image_removed' );
		stats.recordEvent( 'Featured image removed' );
	}

	renderMediaModal = () => {
		if ( ! this.props.site ) {
			return;
		}

		return (
			<MediaLibrarySelectedData siteId={ this.props.site.ID }>
				<MediaModal
					visible={ this.props.selecting || this.state.isSelecting }
					onClose={ this.setImage }
					site={ this.props.site }
					labels={ { confirm: this.props.translate( 'Set Featured Image' ) } }
					enabledFilters={ [ 'images' ] }
					single
				/>
			</MediaLibrarySelectedData>
		);
	};

	renderCurrentImage = () => {
		if ( ! this.props.site || ! this.props.post ) {
			return;
		}

		const itemId = getFeaturedImageId( this.props.post );
		if ( ! itemId ) {
			return;
		}

		return (
			<EditorFeaturedImagePreviewContainer
				siteId={ this.props.site.ID }
				itemId={ itemId }
				maxWidth={ this.props.maxWidth }
			/>
		);
	};

	render() {
		const { site, post } = this.props;
		const featuredImageId = getFeaturedImageId( post );
		const classes = classnames( 'editor-featured-image', {
			'is-assigned': getFeaturedImageId( this.props.post ),
			'has-active-drop-zone': this.props.hasDropZone && this.props.isDropZoneVisible,
		} );

		return (
			<div className={ classes }>
				{ site && featuredImageId && isNumber( featuredImageId ) ? (
					<QueryMedia siteId={ site.ID } mediaId={ featuredImageId } />
				) : null }
				{ this.renderMediaModal() }
				<div className="editor-featured-image__inner-content">
					<Button
						className="editor-featured-image__current-image"
						onClick={ this.showMediaModal }
						borderless
						compact
						data-tip-target="editor-featured-image-current-image"
					>
						{ this.renderCurrentImage() }
						<Gridicon icon="pencil" className="editor-featured-image__edit-icon" />
					</Button>
					{ featuredImageId && <RemoveButton onRemove={ EditorFeaturedImage.removeImage } /> }
				</div>

				{ this.props.hasDropZone && <FeaturedImageDropZone /> }
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const { post, site } = ownProps;
		const siteId = site && site.ID;
		const featuredImageId = getFeaturedImageId( post );

		return {
			featuredImage: getMediaItem( state, siteId, featuredImageId ),
			isDropZoneVisible: isDropZoneVisible( state, 'featuredImage' ),
		};
	},
	{
		recordTracksEvent,
	}
)( localize( EditorFeaturedImage ) );
