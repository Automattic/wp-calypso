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

const VRImage = ( { className, url, view } ) => (
	<div className={ className }>
		<iframe
			title={ __( 'VR Image', 'jetpack' ) }
			allowFullScreen="true"
			frameBorder="0"
			width="100%"
			height="300"
			src={
				'https://vr.me.sh/view/?view=' +
				encodeURIComponent( view ) +
				'&url=' +
				encodeURIComponent( url )
			}
		/>
	</div>
);

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

	edit: ( { attributes, className, setAttributes } ) => {
		const onChangeUrl = value => setAttributes( { url: value.trim() } );
		const onChangeView = value => setAttributes( { view: value } );

		if ( attributes.url && attributes.view ) {
			return <VRImage className={ className } url={ attributes.url } view={ attributes.view } />;
		}
		return (
			<div>
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
	save: ( { className, attributes } ) => (
		<VRImage className={ className } url={ attributes.url } view={ attributes.view } />
	),
} );
