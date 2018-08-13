/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import ImageSelector from 'blocks/image-selector';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSite } from 'state/sites/selectors';

class ImageSelectorExample extends Component {
	constructor( props ) {
		super( props );
		const imageIds = [];
		this.state = {
			imageIds,
		};
	}

	setImage = media => {
		if ( ! media || ! media.items.length ) {
			return;
		}
		const itemIds = media.items.map( item => item.ID );
		this.setState( { imageIds: itemIds } );
	};

	changeImages = images => {
		const imageIds = images.map( image => image.ID );
		this.setState( { imageIds: imageIds } );
	};

	removeImage = image => {
		const itemIds = [ ...this.state.imageIds ];
		itemIds.splice( itemIds.indexOf( image.ID ), 1 );
		this.setState( { imageIds: itemIds } );
	};

	addImage = image => {
		if ( this.state.imageIds.indexOf( image.ID ) === -1 ) {
			this.setState( {
				imageIds: [ ...this.state.imageIds, image.ID ],
			} );
		}
	};

	render() {
		const imageIds = this.state.imageIds;
		const { site, siteId } = this.props;

		return (
			<div className="docs__design-image-selector">
				<ImageSelector
					site={ site }
					siteId={ siteId }
					compact={ imageIds && imageIds.length > 0 }
					imageIds={ imageIds }
					onImageSelected={ this.setImage }
					onImageChange={ this.changeImages }
					onRemoveImage={ this.removeImage }
					onAddImage={ this.addImage }
					multiple={ true }
					showEditIcon={ true }
					hasDropZone
				/>
			</div>
		);
	}
}

const ConnectedImageSelectorExample = connect( state => {
	const siteId = get( getCurrentUser( state ), 'primary_blog', null );
	const site = getSite( state, siteId );

	return {
		site,
		siteId,
	};
} )( ImageSelectorExample );

ConnectedImageSelectorExample.displayName = 'ImageSelector';

export default ConnectedImageSelectorExample;
