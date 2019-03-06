/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { Placeholder, SelectControl, TextControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import VRImageSave from './save';
import { __ } from '../../utils/i18n';

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
				label={ __( 'VR Image' ) }
				className={ className }
			>
				<TextControl
					type="url"
					label={ __( 'Enter URL to VR image' ) }
					value={ attributes.url }
					onChange={ this.onChangeUrl }
				/>
				<SelectControl
					label={ __( 'View Type' ) }
					disabled={ ! attributes.url }
					value={ attributes.view }
					onChange={ this.onChangeView }
					options={ [
						{ label: '', value: '' },
						{ label: __( '360°' ), value: '360' },
						{ label: __( 'Cinema' ), value: 'cinema' },
					] }
				/>
			</Placeholder>
		);
	}
}
