/** @format */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Placeholder, SelectControl, TextControl } from '@wordpress/components';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './editor.scss';

registerBlockType( 'jetpack/vr', {
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

	edit: props => {
		const { attributes, setAttributes } = props;

		const onChangeUrl = value => setAttributes( { url: value.trim() } );
		const onChangeView = value => setAttributes( { view: value } );

		if ( attributes.url && attributes.view ) {
			return (
				<div className={ props.className }>
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
		}
		return (
			<div>
				<Placeholder
					key="placeholder"
					icon="format-image"
					label={ __( 'VR Image', 'jetpack' ) }
					className={ props.className }
				>
					<TextControl
						type="url"
						style={ { flex: '1 1 auto' } }
						label={ __( 'Enter URL to VR image', 'jetpack' ) }
						value={ attributes.url }
						onChange={ onChangeUrl }
					/>
					<SelectControl
						label={ __( 'View Type', 'jetpack' ) }
						disabled={ ! attributes.url }
						value={ attributes.view }
						onChange={ onChangeView }
						options={ [
							{ label: '', value: '' },
							{ label: __( '360°', 'jetpack' ), value: '360' },
							{ label: __( 'Cinema', 'jetpack' ), value: 'cinema' },
						] }
					/>
				</Placeholder>
			</div>
		);
	},
	save: props => {
		return (
			<div className={ props.className }>
				<iframe
					title={ __( 'VR Image', 'jetpack' ) }
					allowFullScreen="true"
					frameBorder="0"
					width="100%"
					height="300"
					src={
						'https://vr.me.sh/view/?view=' +
						encodeURIComponent( props.attributes.view ) +
						'&url=' +
						encodeURIComponent( props.attributes.url )
					}
				/>
			</div>
		);
	},
} );
