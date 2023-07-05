import { localizeUrl } from '@automattic/i18n-utils';
import { addFilter } from '@wordpress/hooks';
import './style.css';

declare global {
	interface Window {
		_currentSiteId: number;
		_currentSiteType: string;
		wpcomDocumentationLinksLocale: string;
	}
}

function overrideCoreDocumentationLinksToWpcom( translation: string, text: string ) {
	switch ( text ) {
		case 'https://wordpress.org/support/article/excerpt/':
		case 'https://wordpress.org/support/article/settings-sidebar/#excerpt':
		case 'https://wordpress.org/documentation/article/page-post-settings-sidebar/#excerpt':
			return localizeUrl(
				'https://wordpress.com/support/excerpts/',
				window.wpcomDocumentationLinksLocale
			);
		case 'https://wordpress.org/support/article/writing-posts/#post-field-descriptions':
		case 'https://wordpress.org/support/article/settings-sidebar/#permalink':
		case 'https://wordpress.org/documentation/article/page-post-settings-sidebar/#permalink':
			return localizeUrl(
				'https://wordpress.com/support/permalinks-and-slugs/',
				window.wpcomDocumentationLinksLocale
			);
		case 'https://wordpress.org/support/article/wordpress-editor/':
			return localizeUrl(
				'https://wordpress.com/support/wordpress-editor/',
				window.wpcomDocumentationLinksLocale
			);
		case 'https://wordpress.org/support/article/site-editor/':
			return localizeUrl(
				'https://wordpress.com/support/site-editor/',
				window.wpcomDocumentationLinksLocale
			);
		case 'https://wordpress.org/support/article/block-based-widgets-editor/':
			return localizeUrl(
				'https://wordpress.com/support/widgets/',
				window.wpcomDocumentationLinksLocale
			);
		case 'https://wordpress.org/plugins/classic-widgets/':
			return localizeUrl(
				'https://wordpress.com/plugins/classic-widgets',
				window.wpcomDocumentationLinksLocale
			);
		case 'https://wordpress.org/support/article/styles-overview/':
			return localizeUrl(
				'https://wordpress.com/support/using-styles/',
				window.wpcomDocumentationLinksLocale
			);
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
