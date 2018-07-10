/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './editor.scss';
import MediaUpload from '../../../media-upload';

export const name = 'core/image';

export const settings = {
	id: 'image',

	title: __( 'Inline Image' ),

	type: 'image',

	icon: 'format-image',

	edit( { onSave } ) {
		return (
			<MediaUpload
				type="image"
				onSelect={ ( media ) => onSave( media ) }
				onClose={ () => onSave( null ) }
				render={ ( { open } ) => {
					open();
					return null;
				} }
			/>
		);
	},

	save( { id, url, alt, width } ) {
		return (
			<img
				className={ `wp-image-${ id }` }
				// set width in style attribute to prevent Block CSS from overriding it
				style={ { width: `${ Math.min( width, 150 ) }px` } }
				src={ url }
				alt={ alt }
			/>
		);
	},
};
