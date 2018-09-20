/** @format */

/**
 * External dependencies
 */
import { __, _x } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/editor';
import { PanelBody, RadioControl } from '@wordpress/components';

export default ( { attributes, setAttributes } ) => {
	return (
		<InspectorControls>
			<PanelBody title={ __( 'Jetpack Gallery Settings' ) }>
				<RadioControl
					label={ __( 'Gallery style' ) }
					selected={ attributes.jetpackGalleryStyle }
					options={ [
						{ label: _x( 'Default', 'Gallery format' ), value: 'default' },
						{ label: _x( 'Tiles', 'Gallery format' ), value: 'tile' },
						{ label: _x( 'Circles', 'Gallery format' ), value: 'circle' },
					] }
					onChange={ value => setAttributes( { jetpackGalleryStyle: value } ) }
				/>
			</PanelBody>
		</InspectorControls>
	);
};
