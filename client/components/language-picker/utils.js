/**
 */

/**
 * External dependencies
 */
import { find, get, includes, isArray } from 'lodash';
import { LANGUAGE_GROUPS, DEFAULT_LANGUAGE_GROUP } from './constants';

/**
 * Returns territory slug from constant: LANGUAGE_GROUPS
 *
 * @param {string} id territory id
 * @param {Array} languageGroups collection of territory data
 * @returns {string} territory slug
 */
export function getLanguageGroupById( id, languageGroups = LANGUAGE_GROUPS ) {
	return find( languageGroups, ( l ) => l.id === id );
}

/**
 * Returns language group id from constant LANGUAGE_GROUPS by territoryId
 *
 * @param {string} territoryId territory id
 * @param {Array} languageGroups collection of territory data
 * @param {string} defaultLanguageGroup default language group if no other found
 * @returns {string} language group id
 */
export function getLanguageGroupFromTerritoryId(
	territoryId,
	languageGroups = LANGUAGE_GROUPS,
	defaultLanguageGroup = DEFAULT_LANGUAGE_GROUP
) {
	const languageGroup = find( languageGroups, ( t ) => includes( t.subTerritories, territoryId ) );
	return languageGroup ? languageGroup.id : defaultLanguageGroup;
}

/**
 * Returns language group id using langSlug to get territoryId
 *
 * @param {string} langSlug  language slug
 * @param {Array} languages collection of language data in config
 * @param {boolean} openInPopular  if langSlug is popular return popular language group id
 * @returns {string} language group id
 */
export function getLanguageGroupByLangSlug( langSlug, languages, openInPopular = false ) {
	const language = find( languages, ( l ) => l.langSlug === langSlug );
	const territoryId =
		language && isArray( language.territories ) ? language.territories[ 0 ] : null;
	return get( language, 'popular', null ) && openInPopular === true
		? 'popular'
		: getLanguageGroupFromTerritoryId( territoryId );
}

/**
 * Returns language group id from constant: LANGUAGE_GROUPS
 *
 * @param {string} countryCode country code id
 * @param {Array} languageGroups collection of territory data
 * @param {string} defaultLanguageGroup default territory slug if none found
 * @returns {string} language group id
 */
export function getLanguageGroupByCountryCode(
	countryCode,
	languageGroups = LANGUAGE_GROUPS,
	defaultLanguageGroup = DEFAULT_LANGUAGE_GROUP
) {
	const languageGroup = find( languageGroups, ( t ) => includes( t.countries, countryCode ) );
	return languageGroup ? languageGroup.id : defaultLanguageGroup;
}

/**
 * Splits and returns language code labels based on langSlug
 * Assumes the following langSlug formats: xx, xx-yy, xx-yy_variant, xx_variant
 *
 * @param {string} langSlug value of config.language[ langSlug ].langSlug
 * @returns {object} { langCode: 'xx', langSubcode: 'xx' } | {}
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
