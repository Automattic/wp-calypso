/** @format */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelBody, RadioControl } from '@wordpress/components';
import { InspectorControls } from '@wordpress/editor';
import { Component } from '@wordpress/element';

class TiledGalleryInspectorControls extends Component {
	Static = {
		galleryFormat: 'default',
	};

	onChangeGalleryFormat = galleryFormat => {
		this.props.setAttributes( { galleryFormat } );
	};

	render() {

		return (
			<InspectorControls>
				<PanelBody title={ __( 'Jetpack Tiled Gallery Settings' ) }>
					<RadioControl
						label={ __( 'Gallery format' ) }
						selected={ this.props.attributes.galleryFormat }
						options={ [
							{ label: 'Default', value: 'default' },
							{ label: 'Tiles', value: 'tile' },
							{ label: 'Circles', value: 'circle' },
						] }
						onChange={ this.onChangeGalleryFormat }
					/>
				</PanelBody>
			</InspectorControls>
		);
	}
}

export default TiledGalleryInspectorControls;
