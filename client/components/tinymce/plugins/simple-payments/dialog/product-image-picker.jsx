/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */

import AsyncLoad from 'components/async-load';
import { getSelectedSiteId } from 'state/ui/selectors';
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import EditorFeaturedImagePreviewContainer from 'post-editor/editor-featured-image/preview-container';
import RemoveButton from 'components/remove-button';

class ProductImagePicker extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		translate: PropTypes.func,
	};

	state = {
		isSelecting: false,
	};

	showMediaModal = event => {
		if ( event.key && event.key !== 'Enter' ) {
			// A11y - prevent opening Media modal with any key
			return;
		}

		this.setState( { isSelecting: true } );
	};

	setImage = value => {
		this.setState( { isSelecting: false }, () => {
			if ( ! value ) {
				return;
			}

			this.props.input.onChange( value.items[ 0 ].ID );
		} );
	};

	removeCurrentImage = event => {
		event.stopPropagation();

		this.props.input.onChange( false );
	};

	getImagePlaceholder() {
		return (
			<div
				className="dialog__product-image-placeholder"
				onClick={ this.showMediaModal }
				onKeyDown={ this.showMediaModal }
				role="button"
				tabIndex={ 0 }
			>
				<Gridicon icon="add-image" size={ 36 } />
				{ this.props.translate( 'Add an Image' ) }
			</div>
		);
	}

	getCurrentImage() {
		const { siteId } = this.props;

		return (
			<div
				className="dialog__product-image"
				onClick={ this.showMediaModal }
				onKeyDown={ this.showMediaModal }
				role="button"
				tabIndex={ 0 }
			>
				<EditorFeaturedImagePreviewContainer
					siteId={ siteId }
					itemId={ this.props.input.value }
					onImageChange={ this.props.input.onChange }
					showEditIcon
				/>
				<RemoveButton onRemove={ this.removeCurrentImage } />
			</div>
		);
	}

	render() {
		const { siteId, translate, makeDirtyAfterImageEdit } = this.props;
		const { isSelecting } = this.state;

		if ( ! siteId ) {
			return;
		}

		return (
			<div className="dialog__product-image-picker">
				<MediaLibrarySelectedData siteId={ siteId }>
					<AsyncLoad
						require="post-editor/media-modal"
						siteId={ siteId }
						onClose={ this.setImage }
						enabledFilters={ [ 'images' ] }
						visible={ isSelecting }
						isBackdropVisible={ false }
						labels={ {
							confirm: translate( 'Add' ),
						} }
						single
						onImageEditorDoneHook={ makeDirtyAfterImageEdit }
					/>
				</MediaLibrarySelectedData>

				<div className="dialog__product-image-container">
					{ this.props.input.value && this.getCurrentImage() }
					{ ! this.props.input.value && this.getImagePlaceholder() }
				</div>
			</div>
		);
	}
}

export default connect( state => ( { siteId: getSelectedSiteId( state ) } ) )(
	localize( ProductImagePicker )
);
