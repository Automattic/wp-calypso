import { createHigherOrderComponent } from '@wordpress/compose';
import { createElement } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

const DisableHEICImages = createHigherOrderComponent( ( MediaPlaceholder ) => {
	return ( props ) => {
		props.onFilesPreUpload = ( files ) => {
			if ( files ) {
				const error = __(
					'HEIC images are not viewable in the editor. Please convert to a JPG, PNG, or GIF and try again.',
					'full-site-editing'
				);
				Object.values( files ).filter( ( file ) => {
					if ( 'image/heic' === file.type ) {
						props.onError( error );
						throw Error( error );
					}
				} );
				return files;
			}
		};

		return createElement( MediaPlaceholder, props );
	};
}, 'DisableHEICImages' );

addFilter( 'editor.MediaPlaceholder', 'wpcom/DisableHEICImages', DisableHEICImages );
