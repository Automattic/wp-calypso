/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import MediaModal from 'post-editor/media-modal';
import PostActions from 'lib/posts/actions';
import PostUtils from 'lib/posts/utils';
import * as stats from 'lib/posts/stats';
import EditorFeaturedImagePreviewContainer from './preview-container';
import Button from 'components/button';

export default React.createClass( {
	displayName: 'EditorFeaturedImage',

	propTypes: {
		maxWidth: React.PropTypes.number,
		site: React.PropTypes.object,
		post: React.PropTypes.object,
		selecting: React.PropTypes.bool,
		onImageSelected: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			maxWidth: 450,
			onImageSelected: () => {}
		};
	},

	getInitialState() {
		return {
			isSelecting: false
		};
	},

	showMediaModal() {
		this.setState( {
			isSelecting: true
		} );
	},

	hideMediaModal() {
		this.setState( {
			isSelecting: false
		} );
	},

	setImage( value ) {
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
	},

	renderMediaModal() {
		if ( ! this.props.site ) {
			return;
		}

		return (
			<MediaLibrarySelectedData siteId={ this.props.site.ID }>
				<MediaModal
					visible={ this.props.selecting || this.state.isSelecting }
					onClose={ this.setImage }
					site={ this.props.site }
					labels={ { confirm: this.translate( 'Set Featured Image' ) } }
					enabledFilters={ [ 'images' ] }
					single />
			</MediaLibrarySelectedData>
		);
	},

	renderCurrentImage() {
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
	},

	render() {
		const classes = classnames( 'editor-featured-image', {
			'is-assigned': !! PostUtils.getFeaturedImageId( this.props.post )
		} );

		return (
			<Button
				onClick={ this.showMediaModal }
				borderless
				className={ classes }>
				{ this.renderMediaModal() }
				<div className="editor-featured-image__current-image">
					{ this.renderCurrentImage() }
					<Gridicon
						icon="pencil"
						className="editor-featured-image__edit-icon" />
				</div>
			</Button>
		);
	}
} );
