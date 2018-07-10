/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { RichText } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './style.scss';
import './theme.scss';
import edit from './edit';

export const name = 'core/video';

export const settings = {
	title: __( 'Video' ),

	description: __( 'Embed a video file and a simple video player.' ),

	icon: 'format-video',

	category: 'common',

	attributes: {
		id: {
			type: 'number',
		},
		src: {
			type: 'string',
			source: 'attribute',
			selector: 'video',
			attribute: 'src',
		},
		caption: {
			type: 'array',
			source: 'children',
			selector: 'figcaption',
		},
	},

	supports: {
		align: true,
	},

	edit,

	save( { attributes } ) {
		const { src, caption } = attributes;
		return (

			<figure>
				{ src && <video controls src={ src } /> }
				{ caption && caption.length > 0 && <RichText.Content tagName="figcaption" value={ caption } /> }
			</figure>
		);
	},
};
