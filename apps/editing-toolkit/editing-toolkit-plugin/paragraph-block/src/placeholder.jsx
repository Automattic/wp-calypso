import { addFilter } from '@wordpress/hooks';

addFilter(
	'blocks.registerBlockType',
	'full-site-editing/wpcom-paragraph-block/placeholder',
	( settings, name ) => {
		if ( name !== 'core/paragraph' || ! window.wpcomParagraphBlockPlaceholder ) {
			return settings;
		}

		return {
			...settings,
			attributes: {
				...settings.attributes,
				placeholder: {
					...settings.attributes.placeholder,
					default: window.wpcomParagraphBlockPlaceholder,
				},
			},
		};
	}
);
