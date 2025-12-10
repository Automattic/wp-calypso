import { type Block } from '@wordpress/blocks';
import formats from '@wordpress/format-library/build-module/default-formats';
import { registerFormatType } from '@wordpress/rich-text';

export const loadTextFormatting = ( extraFormats: Block[ 'name' ][] = [] ) => {
	// Only register the formats we need
	formats.forEach( ( { name, ...settings } ) => {
		if ( [ 'core/bold', 'core/italic', 'core/link', ...extraFormats ].includes( name ) ) {
			registerFormatType( name, settings );
		}
	} );
};
