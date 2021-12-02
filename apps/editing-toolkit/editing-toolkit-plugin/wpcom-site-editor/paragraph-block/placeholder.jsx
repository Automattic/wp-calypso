import { store as blockEditorStore } from '@wordpress/block-editor';
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { addFilter } from '@wordpress/hooks';

addFilter(
	'blocks.registerBlockType',
	'full-site-editing/wpcom-site-editor/paragraph-block-placeholder',
	( settings, name ) => {
		if ( name !== 'core/paragraph' ) {
			return settings;
		}

		return {
			...settings,
			edit: compose(
				withSelect( ( select, { attributes } ) => {
					const { getSettings } = select( blockEditorStore );
					const { bodyPlaceholder } = getSettings();

					return {
						attributes: {
							...attributes,
							placeholder: attributes.placeholder || bodyPlaceholder,
						},
					};
				} )
			)( settings.edit ),
		};
	}
);
