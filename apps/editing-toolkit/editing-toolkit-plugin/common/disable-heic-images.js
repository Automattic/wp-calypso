import { createHigherOrderComponent } from '@wordpress/compose';
import { createElement } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

const DisableHEICImages = createHigherOrderComponent( ( MediaPlaceholder ) => {
	return ( props ) => {
		return createElement( MediaPlaceholder, {
			...props,
			onFilesPreUpload: ( files ) => {
				if ( files ) {
					Object.values( files ).forEach( ( file ) => {
						const filename = file.name;
						const extension = filename.split( '.' ).pop()?.toLowerCase();

						if ( 'heic' === extension || 'heif' === extension ) {
							const error = __(
								'HEIC images are not viewable in the editor. Please convert to a JPG, PNG, or GIF and try again.',
								'full-site-editing'
							);
							props.onError( error );
							throw Error( error );
						}
					} );
					return files;
				}
			},
		} );
	};
}, 'DisableHEICImages' );

addFilter( 'editor.MediaPlaceholder', 'wpcom/DisableHEICImages', DisableHEICImages );
