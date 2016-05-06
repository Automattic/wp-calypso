/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
/**
 * Internal dependencies
 */
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import EditorMediaModal from 'post-editor/media-modal';
import PostActions from 'lib/posts/actions';
import PostUtils from 'lib/posts/utils';
import * as stats from 'lib/posts/stats';
import EditorFeaturedImagePreviewContainer from './preview-container';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import {
	setFeaturedImage,
	removeFeaturedImage
} from 'state/ui/editor/post/actions';

const EditorFeaturedImage = React.createClass( {
	propTypes: {
		maxWidth: React.PropTypes.number,
		site: React.PropTypes.object,
		post: React.PropTypes.object,
		setFeaturedImage: React.PropTypes.func,
		removeFeaturedImage: React.PropTypes.func,
		selecting: React.PropTypes.bool,
		onImageSelected: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			maxWidth: 450,
			setFeaturedImage: () => {},
			removeFeaturedImage: () => {},
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

	setImage( items ) {
		this.hideMediaModal();
		this.props.onImageSelected();

		if ( ! items || ! items.length ) {
			return;
		}

		this.props.setFeaturedImage( items[0].ID );

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.edit( {
			featured_image: items[0].ID
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
				<EditorMediaModal
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

export default connect(
	null,
	dispatch => bindActionCreators( { setFeaturedImage, removeFeaturedImage }, dispatch ),
	null,
	{ pure: false }
)( EditorFeaturedImage );
