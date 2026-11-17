// `@wordpress/format-library` only exposes its side-effect entry, which registers all 15 built-in
// formats, so remove the ones comments don't offer.
import '@wordpress/format-library';
import { select } from '@wordpress/data';
import { store as richTextStore, unregisterFormatType } from '@wordpress/rich-text';

const ALLOWED_FORMATS = [ 'core/bold', 'core/italic', 'core/link' ];

export const loadTextFormatting = () => {
	select( richTextStore )
		.getFormatTypes()
		.forEach( ( { name } ) => {
			if ( ! ALLOWED_FORMATS.includes( name ) ) {
				unregisterFormatType( name );
			}
		} );
};
