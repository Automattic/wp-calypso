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
			attributes: {
				...settings.attributes,
				placeholder: {
					...settings.attributes.placeholder,
					default: window.wpcomSiteEditorParagraphPlaceholder,
				},
			},
		};
	}
);
