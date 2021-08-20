import { createHigherOrderComponent } from '@wordpress/compose';
import { createElement } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';

const DisableHEICImages = createHigherOrderComponent( ( MediaPlaceholder ) => {
	return ( props ) => {
		props.onFilesPreUpload = ( files ) => {
			if ( files ) {
				return Object.values( files ).filter( ( file ) => {
					if ( 'image/heic' !== file.type ) {
						return file;
					}
				} );
			}
		};

		return createElement( MediaPlaceholder, props );
	};
}, 'DisableHEICImages' );

addFilter( 'editor.MediaPlaceholder', 'wpcom/DisableHEICImages', DisableHEICImages );
