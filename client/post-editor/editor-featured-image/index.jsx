/**
 * External dependencies
 */
import classnames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { isNumber } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import EditorFeaturedImagePreviewContainer from './preview-container';
import Button from 'components/button';
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import QueryMedia from 'components/data/query-media';
import MediaActions from 'lib/media/actions';
import PostActions from 'lib/posts/actions';
import * as stats from 'lib/posts/stats';
import PostUtils from 'lib/posts/utils';
import { getFeaturedImageId } from 'lib/posts/utils';
import MediaModal from 'post-editor/media-modal';
import { recordTracksEvent } from 'state/analytics/actions';
import { getMediaItem } from 'state/selectors';

class EditorFeaturedImage extends Component {
	static propTypes = {
		featuredImage: PropTypes.object,
		maxWidth: PropTypes.number,
		site: PropTypes.object,
		post: PropTypes.object,
		recordTracksEvent: PropTypes.func,
		selecting: PropTypes.bool,
		translate: PropTypes.func,
		onImageSelected: PropTypes.func,
	};

	static defaultProps = {
		maxWidth: 450,
		onImageSelected: () => {}
	};

	state = {
		isSelecting: false
	};

	showMediaModal = () => {
		const { featuredImage, site } = this.props;

		if ( featuredImage ) {
			MediaActions.setLibrarySelectedItems( site.ID, [ featuredImage ] );
		}

		this.setState( {
			isSelecting: true
		} );
	};

	hideMediaModal = () => {
		this.setState( {
			isSelecting: false
		} );
	};

	setImage = ( value ) => {
		this.hideMediaModal();
		this.props.onImageSelected();

		if ( ! value ) {
			return;
		}

		PostActions.edit( {
			featured_image: value.items[ 0 ].ID
		} );

		stats.recordStat( 'featured_image_set' );
		stats.recordEvent( 'Featured image set' );

		this.props.recordTracksEvent( 'calypso_editor_featured_image_upload', {
			source: 'medialibrary',
			type: 'click'
		} );
	};

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
					single />
			</MediaLibrarySelectedData>
		);
	};

	renderCurrentImage = () => {
		if ( ! this.props.site || ! this.props.post ) {
			return;
		}

		const itemId = PostUtils.getFeaturedImageId( this.props.post );
		if ( ! itemId ) {
			return;
		}

		return (
			<EditorFeaturedImagePreviewContainer
				siteId={ this.props.site.ID }
				itemId={ itemId }
				maxWidth={ this.props.maxWidth } />
		);
	};

	render() {
		const { site, post } = this.props;
		const featuredImageId = getFeaturedImageId( post );
		const classes = classnames( 'editor-featured-image', {
			'is-assigned': !! PostUtils.getFeaturedImageId( this.props.post )
		} );

		return (
			<div className={ classes }>
				{
					site && featuredImageId && isNumber( featuredImageId )
						? <QueryMedia siteId={ site.ID } mediaId={ featuredImageId } />
						: null
				}
				{ this.renderMediaModal() }
				<Button
						className="editor-featured-image__current-image"
						onClick={ this.showMediaModal }
						borderless
						compact>
					{ this.renderCurrentImage() }
					<Gridicon
						icon="pencil"
						className="editor-featured-image__edit-icon" />
				</Button>
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
		};
	},
	{
		recordTracksEvent
	}
)( localize( EditorFeaturedImage ) );
