/**
 * Splits and returns language code labels based on langSlug
 * Assumes the following langSlug formats: xx, xx-yy, xx-yy_variant, xx_variant
 *
 * @param {string} langSlug value of config.language[ langSlug ].langSlug
 * @returns {Object} { langCode: 'xx', langSubcode: 'xx' } | {}
 */
export function getLanguageCodeLabels( langSlug ) {
	const languageCodeLabels = {};

	if ( ! langSlug ) {
		return languageCodeLabels;
	}

	const languageCodes = langSlug.split( /[_-]+/ );

	languageCodeLabels.langCode = languageCodes[ 0 ];
	languageCodeLabels.langSubcode = langSlug.indexOf( '-' ) > -1 ? languageCodes[ 1 ] : undefined;

	return {
		...languageCodeLabels,
	};
}
