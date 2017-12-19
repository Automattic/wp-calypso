/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { find, get, includes, isArray } from 'lodash';
import { LANGUAGE_GROUPS, DEFAULT_LANGUAGE_GROUP } from './constants';

/**
 * Returns territory slug from constant: LANGUAGE_GROUPS
 *
 * @param {String} id territory id
 * @param {Array} language_groups collection of territory data
 * @returns {String} territory slug
 */
export function getLanguageGroupById( id, language_groups = LANGUAGE_GROUPS ) {
	return find( language_groups, l => l.id === id );
}

/**
 * Returns language group id from constant LANGUAGE_GROUPS by territoryId
 *
 * @param {String} territoryId territory id
 * @param {Array} language_groups collection of territory data
 * @param {String} defaultLanguageGroup default language group if no other found
 * @returns {String} language group id
 */
export function getLanguageGroupFromTerritoryId(
	territoryId,
	language_groups = LANGUAGE_GROUPS,
	defaultLanguageGroup = DEFAULT_LANGUAGE_GROUP
) {
	const language_group = find( language_groups, t => includes( t.subTerritories, territoryId ) );
	return language_group ? language_group.id : defaultLanguageGroup;
}

/**
 * Returns language group id using langSlug to get territoryId
 *
 * @param {String} langSlug  language slug
 * @param {Array} languages collection of language data in config
 * @param {Boolean} openInPopular  if langSlug is popular return popular language group id
 * @returns {String} language group id
 */
export function getLanguageGroupByLangSlug( langSlug, languages, openInPopular = false ) {
	const language = find( languages, l => l.langSlug === langSlug );
	const territoryId =
		language && isArray( language.territories ) ? language.territories[ 0 ] : null;
	return get( language, 'popular', null ) && openInPopular === true
		? 'popular'
		: getLanguageGroupFromTerritoryId( territoryId );
}
