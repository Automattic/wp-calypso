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
import { getMediaItem } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import MediaActions from 'lib/media/actions';
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import ProductImage from './product-image';
import RemoveButton from 'components/remove-button';

class ProductImagePicker extends Component {
	static propTypes = {
		featuredImage: PropTypes.object,
		siteId: PropTypes.number,
		translate: PropTypes.func,
	};

	state = {
		isSelecting: false,
	};

	showMediaModal = () => {
		const { siteId, featuredImage } = this.props;

		if ( featuredImage ) {
			MediaActions.setLibrarySelectedItems( siteId, [ featuredImage ] );
		}

		this.setState( { isSelecting: true } );
	};

	hideMediaModal = () => this.setState( { isSelecting: false } );

	setImage = value => {
		this.hideMediaModal();

		if ( ! value ) {
			return;
		}

		this.props.input.onChange( value.items[ 0 ].ID );
	};

	removeCurrentImage = event => {
		event.stopPropagation();

		this.props.input.onChange( false );
	};

	getImagePlaceholder() {
		return (
			<div className="dialog__product-image-placeholder">
				<Gridicon icon="add-image" size={ 36 } />
				{ this.props.translate( 'Add an Image' ) }
			</div>
		);
	}

	getCurrentImage() {
		const { siteId } = this.props;

		return (
			<div className="dialog__product-image">
				<ProductImage siteId={ siteId } imageId={ this.props.input.value } />
				<RemoveButton onRemove={ this.removeCurrentImage } />
				<Gridicon icon="pencil" className="dialog__product-image-edit-icon" />
			</div>
		);
	}

	render() {
		const { siteId, translate } = this.props;

		if ( ! siteId ) {
			return;
		}

		return (
			<div>
				<MediaLibrarySelectedData siteId={ siteId }>
					<AsyncLoad
						require="post-editor/media-modal"
						siteId={ siteId }
						onClose={ this.setImage }
						enabledFilters={ [ 'images' ] }
						visible={ this.state.isSelecting }
						labels={ {
							confirm: translate( 'Add' ),
						} }
						single
					/>
				</MediaLibrarySelectedData>

				<div
					className="dialog__product-image-container"
					onClick={ this.showMediaModal }
					onKeyDown={ this.showMediaModal }
					role="button"
					tabIndex={ 0 }
				>
					{ this.props.input.value && this.getCurrentImage() }
					{ ! this.props.input.value && this.getImagePlaceholder() }
				</div>
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		featuredImage: getMediaItem( state, siteId, ownProps.input.value ),
	};
} )( localize( ProductImagePicker ) );
