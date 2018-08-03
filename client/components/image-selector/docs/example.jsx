/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import ImageSelector from 'components/image-selector';

export default class ImageSelectorExample extends Component {

	constructor( props ) {
		super( props );
		const imageIds = [];
		this.state = {
			imageIds
		};
	}

	setImage = ( media ) => {
		if ( ! media || ! media.items.length ) {
			return;
		}
		const itemIds = media.items.map( item => item.ID );
        this.setState( { imageIds: itemIds } );
	}

	changeImages = ( images ) => {
		const imageIds = images.map( image => image.ID );
		this.setState( { imageIds: imageIds } );
	}

	removeImage = ( image ) => {
		const itemIds = [ ...this.state.imageIds ];
		itemIds.splice( itemIds.indexOf( image.ID ), 1 );
		this.setState( { imageIds: itemIds } );
	}

	addImage = ( image ) => {
		if ( this.state.imageIds.indexOf( image.ID ) === -1 ) {
			this.setState( {
				imageIds: [...this.state.imageIds, image.ID ]
			} );
		}
	}

	render() {
		const imageIds = this.state.imageIds;

		return (
			<div className="my-featured-image">
                <ImageSelector
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
