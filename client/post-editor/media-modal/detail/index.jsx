/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { flow, noop, partial } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import MediaUtils from 'lib/media/utils';
import HeaderCake from 'components/header-cake';
import { ModalViews } from 'state/ui/media-modal/constants';
import { setEditorMediaModalView } from 'state/ui/editor/actions';
import DetailItem from './detail-item';
import preloadImage from '../preload-image';

class EditorMediaModalDetail extends Component {

	static propTypes = {
		site: PropTypes.object,
		items: PropTypes.array,
		selectedIndex: PropTypes.number,
		onSelectedIndexChange: PropTypes.func,
		onReturnToList: PropTypes.func,
		onEdit: PropTypes.func,
		onRestore: PropTypes.func,
	};

	static defaultProps = {
		selectedIndex: 0,
		onSelectedIndexChange: noop,
	};

	componentDidMount() {
		this.preloadImages();
	}

	componentDidUpdate() {
		this.preloadImages();
	}

	preloadImages() {
		MediaUtils.filterItemsByMimePrefix( this.props.items, 'image' ).forEach( function( image ) {
			var src = MediaUtils.url( image, {
				photon: this.props.site && ! this.props.site.is_private
			} );

			preloadImage( src );
		}, this );
	}

	incrementIndex = () => this.props.onSelectedIndexChange( this.props.selectedIndex + 1 )

	decrementIndex = () => this.props.onSelectedIndexChange( this.props.selectedIndex - 1 )

	render() {
		const {
			items,
			selectedIndex,
			site,
			onEditImageItem,
			onEditVideoItem,
			onRestoreItem,
			onReturnToList,
			translate,
		} = this.props;

		const item = items[ selectedIndex ];
		const mimePrefix = MediaUtils.getMimePrefix( item );

		return (
			<div className="editor-media-modal-detail">
				<HeaderCake onClick={ onReturnToList } backText={ translate( 'Media Library' ) } />
				<DetailItem
					site={ site }
					item={ item }
					hasPreviousItem={ selectedIndex - 1 >= 0 }
					hasNextItem={ selectedIndex + 1 < items.length }
					onShowPreviousItem={ this.decrementIndex }
					onShowNextItem={ this.incrementIndex }
					onRestore={ onRestoreItem }
					onEdit={ 'video' === mimePrefix ? onEditVideoItem : onEditImageItem }
				/>
			</div>
		);
	}
}

const enhance = flow(
	localize,
	connect(
		null,
		{
			onReturnToList: partial( setEditorMediaModalView, ModalViews.LIST ),
			onEditImageItem: partial( setEditorMediaModalView, ModalViews.IMAGE_EDITOR ),
			onEditVideoItem: partial( setEditorMediaModalView, ModalViews.VIDEO_EDITOR ),
		}
	)
);

export default enhance( EditorMediaModalDetail );
