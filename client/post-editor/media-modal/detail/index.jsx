/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { noop, partial } from 'lodash';

/**
 * Internal dependencies
 */
var DetailItem = require( './detail-item' ),
	MediaUtils = require( 'lib/media/utils' ),
	HeaderCake = require( 'components/header-cake' ),
	preloadImage = require( '../preload-image' );
import { ModalViews } from 'state/ui/media-modal/constants';
import { setEditorMediaModalView } from 'state/ui/editor/actions';

export const EditorMediaModalDetail = React.createClass( {
	propTypes: {
		site: React.PropTypes.object,
		items: React.PropTypes.array,
		selectedIndex: React.PropTypes.number,
		onSelectedIndexChange: React.PropTypes.func,
		onReturnToList: React.PropTypes.func,
		onEdit: React.PropTypes.func,
		onRestore: React.PropTypes.func,
	},

	getDefaultProps: function() {
		return {
			selectedIndex: 0,
			onSelectedIndexChange: noop
		};
	},

	componentDidMount: function() {
		this.preloadImages();
	},

	componentDidUpdate: function() {
		this.preloadImages();
	},

	preloadImages: function() {
		MediaUtils.filterItemsByMimePrefix( this.props.items, 'image' ).forEach( function( image ) {
			var src = MediaUtils.url( image, {
				photon: this.props.site && ! this.props.site.is_private
			} );

			preloadImage( src );
		}, this );
	},

	incrementIndex: function( increment ) {
		this.props.onSelectedIndexChange( this.props.selectedIndex + increment );
	},

	render: function() {
		const {
			items,
			selectedIndex,
			site,

			onEditImageItem,
			onEditVideoItem,
			onRestoreItem,
			onReturnToList,
		} = this.props;

		const item = items[ selectedIndex ];
		const mimePrefix = MediaUtils.getMimePrefix( item );

		return (
			<div className="editor-media-modal-detail">
				<HeaderCake onClick={ onReturnToList } backText={ this.translate( 'Media Library' ) } />
				<DetailItem
					site={ site }
					item={ item }
					hasPreviousItem={ selectedIndex - 1 >= 0 }
					hasNextItem={ selectedIndex + 1 < items.length }
					onShowPreviousItem={ this.incrementIndex.bind( this, -1 ) }
					onShowNextItem={ this.incrementIndex.bind( this, 1 ) }
					onRestore={ onRestoreItem }
					onEdit={ 'video' === mimePrefix ? onEditVideoItem : onEditImageItem } />
			</div>
		);
	}
} );

export default connect( null, {
	onReturnToList: partial( setEditorMediaModalView, ModalViews.LIST ),
	onEditImageItem: partial( setEditorMediaModalView, ModalViews.IMAGE_EDITOR ),
	onEditVideoItem: partial( setEditorMediaModalView, ModalViews.VIDEO_EDITOR ),
} )( EditorMediaModalDetail );
