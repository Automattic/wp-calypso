import { addFilter } from '@wordpress/hooks';
import './style.css';

declare global {
	interface Window {
		_currentSiteId: number;
		_currentSiteType: string;
	}
}

function overrideCoreDocumentationLinksToWpcom( translation: string, text: string ) {
	switch ( text ) {
		case 'https://wordpress.org/support/article/excerpt/':
		case 'https://wordpress.org/support/article/settings-sidebar/#excerpt':
			return 'https://wordpress.com/support/excerpts/';
		case 'https://wordpress.org/support/article/writing-posts/#post-field-descriptions':
		case 'https://wordpress.org/support/article/settings-sidebar/#permalink':
			return 'https://wordpress.com/support/permalinks-and-slugs/';
		case 'https://wordpress.org/support/article/wordpress-editor/':
			return 'https://wordpress.com/support/wordpress-editor/';
		case 'https://wordpress.org/support/article/site-editor/':
			return 'https://wordpress.com/support/site-editor/';
		case 'https://wordpress.org/support/article/block-based-widgets-editor/':
			return 'https://wordpress.com/support/widgets/';
		case 'https://wordpress.org/plugins/classic-widgets/':
			return 'https://wordpress.com/plugins/classic-widgets';
		case 'https://wordpress.org/support/article/styles-overview/':
			return 'https://wordpress.com/support/using-styles/';
	}

	return translation;
}

function hideSimpleSiteTranslations( translation: string, text: string ) {
	switch ( text ) {
		case 'https://wordpress.org/plugins/classic-widgets/':
			return '';
		case 'Want to stick with the old widgets?':
			return '';
		case 'Get the Classic Widgets plugin.':
			return '';
	}

	return translation;
}

addFilter(
	'i18n.gettext_default',
	'full-site-editing/override-core-docs-to-wpcom',
	overrideCoreDocumentationLinksToWpcom,
	9
);

if ( window?._currentSiteType === 'simple' ) {
	addFilter(
		'i18n.gettext_default',
		'full-site-editing/override-core-docs-to-wpcom',
		hideSimpleSiteTranslations,
		10
	);
}
