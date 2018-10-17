/** @format */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { Placeholder, SelectControl, TextControl } from '@wordpress/components';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './editor.scss';

const VRImageSave = ( { attributes, className } ) => (
	<div className={ className }>
		<iframe
			title={ __( 'VR Image', 'jetpack' ) }
			allowFullScreen="true"
			frameBorder="0"
			width="100%"
			height="300"
			src={
				'https://vr.me.sh/view/?view=' +
				encodeURIComponent( attributes.view ) +
				'&url=' +
				encodeURIComponent( attributes.url )
			}
		/>
	</div>
);

class VRImageEdit extends Component {
	onChangeUrl = value => this.props.setAttributes( { url: value.trim() } );
	onChangeView = value => this.props.setAttributes( { view: value } );

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

registerBlockType( 'a8c/vr', {
	title: __( 'VR Image', 'jetpack' ),
	description: __( 'Embed 360° photos and Virtual Reality (VR) Content', 'jetpack' ),
	icon: 'embed-photo',
	category: 'embed',
	support: {
		html: false,
	},
	attributes: {
		url: {
			type: 'string',
			default: '',
		},
		view: {
			type: 'string',
			default: '',
		},
	},

	edit: VRImageEdit,
	save: VRImageSave,
} );
