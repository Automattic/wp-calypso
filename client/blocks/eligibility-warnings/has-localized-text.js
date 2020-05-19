/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

export const hasLocalizedText = ( message ) =>
	i18n.state.localeSlug === i18n.defaultLocaleSlug || i18n.hasTranslation( message );

export default hasLocalizedText;
