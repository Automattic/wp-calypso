import { addFilter } from '@wordpress/hooks';

function overrideCoreDocumentationLinksToWpcom( translation: string, text: string ) {
	switch ( text ) {
		case 'https://wordpress.org/support/article/excerpt/':
			return 'https://wordpress.com/support/excerpts/';
		case 'https://wordpress.org/support/article/writing-posts/#post-field-descriptions':
			return 'https://wordpress.com/support/permalinks-and-slugs/';
	}

	return translation;
}

addFilter(
	'i18n.gettext_default',
	'full-site-editing/override-core-docs-to-wpcom',
	overrideCoreDocumentationLinksToWpcom
);
