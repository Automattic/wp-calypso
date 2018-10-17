/** @format */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { Placeholder, SelectControl, TextControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import VRImageSave from './save';

export default class VRImageEdit extends Component {
	onChangeUrl = value => void this.props.setAttributes( { url: value.trim() } );
	onChangeView = value => void this.props.setAttributes( { view: value } );

	render() {
		const { attributes, className } = this.props;

		if ( attributes.url && attributes.view ) {
			return <VRImageSave attributes={ attributes } className={ className } />;
		}

		return (
			<Placeholder
				key="placeholder"
				icon="format-image"
				label={ __( 'VR Image', 'jetpack' ) }
				className={ className }
			>
				<TextControl
					type="url"
					style={ { flex: '1 1 auto' } }
					label={ __( 'Enter URL to VR image', 'jetpack' ) }
					value={ attributes.url }
					onChange={ this.onChangeUrl }
				/>
				<SelectControl
					label={ __( 'View Type', 'jetpack' ) }
					disabled={ ! attributes.url }
					value={ attributes.view }
					onChange={ this.onChangeView }
					options={ [
						{ label: '', value: '' },
						{ label: __( '360°', 'jetpack' ), value: '360' },
						{ label: __( 'Cinema', 'jetpack' ), value: 'cinema' },
					] }
				/>
			</Placeholder>
		);
	}
}
