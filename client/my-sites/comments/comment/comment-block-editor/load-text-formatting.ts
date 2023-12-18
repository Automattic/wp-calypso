import formats from '@wordpress/format-library/build-module/default-formats';
import { registerFormatType } from '@wordpress/rich-text';

export const loadTextFormatting = () => {
	// Only register the formats we need
	formats.forEach( ( { name, ...settings } ) => {
		if ( [ 'core/bold', 'core/italic', 'core/link' ].includes( name ) ) {
			registerFormatType( name, settings );
		}
	} );
};
