/**
 * External dependencies
 */
import { head, find, get } from 'lodash';

/**
 * Internal dependencies
 */
import { postRequest } from 'calypso/lib/i18n-utils/glotpress';
import {
	GP_PROJECT,
	GP_BASE_URL,
	GP_PROJECT_TRANSLATION_SET_SLUGS,
} from 'calypso/lib/i18n-utils/constants';

/**
 * Prepares and triggers a request to get GP string
 *
 * @param {object} locale and item from `languages` array in config/_shared.json
 * @param {object} originalStringData GP string information { singular, context, plural }
 * @param {string} apiBaseUrl Base API url to get translations
 * @param {string} project GP project
 * @param {Function} post see postRequest()
 * @returns {object} request object
 */
export function getSingleTranslationData(
	locale,
	originalStringData,
	apiBaseUrl = GP_BASE_URL + '/api',
	project = GP_PROJECT,
	post = postRequest
) {
	const glotPressUrl = `${ apiBaseUrl }/translations/-query-by-originals`;
	const postFormData = [
		`project=${ project }`,
		`&locale_slug=${ locale.parentLangSlug || locale.langSlug }`,
		`&translation_set_slug=${ GP_PROJECT_TRANSLATION_SET_SLUGS[ locale.langSlug ] || 'default' }`,
		`&original_strings=${ encodeURIComponent( JSON.stringify( [ originalStringData ] ) ) }`,
	];

	return post( glotPressUrl, postFormData.join( '' ) ).then( ( glotPressDataEntries ) =>
		normalizeDetailsFromTranslationData( head( glotPressDataEntries ) )
	);
}

/**
 * Prepares and triggers a request to get GP string
 *
 * @param {string} originalId GP original string id
 * @param {object} translationObject GP string information { singular, context, plural }
 * @param {object} locale and item from `languages` array in config/_shared.json
 * @param {string} apiBaseUrl Base API url to get translations
 * @param {string} project GP project
 * @param {Function} post see postRequest()
 * @returns {object} request object
 */
export function submitTranslation(
	originalId,
	translationObject,
	locale,
	apiBaseUrl = GP_BASE_URL + '/api',
	project = GP_PROJECT,
	post = postRequest
) {
	const glotPressUrl = `${ apiBaseUrl }/translations/-new`;
	const postFormData = [
		`project=${ project }`,
		`&locale_slug=${ locale.parentLangSlug || locale.langSlug }`,
		`&translation_set_slug=${ GP_PROJECT_TRANSLATION_SET_SLUGS[ locale.langSlug ] || 'default' }`,
		...Object.keys( translationObject ).map(
			( key ) =>
				translationObject[ key ] &&
				`&translation[${ originalId }][]=${ encodeURIComponent( translationObject[ key ] ) }`
		),
	];

	return post( glotPressUrl, postFormData.join( '' ) ).then( ( glotPressData ) =>
		normalizeDetailsFromTranslationData( glotPressData )
	);
}

/**
 * Normalizes raw data from GP API
 *
 * @param {object} glotPressData raw API response
 * @returns {object} normalized data
 */
export function normalizeDetailsFromTranslationData( glotPressData ) {
	const translationDetails = find( glotPressData.translations, {
		original_id: glotPressData.original_id,
	} );

	return {
		originalId: glotPressData.original_id,
		comment: glotPressData.original_comment,
		translatedSingular: get( translationDetails, 'translation_0', '' ),
		translatedPlural: get( translationDetails, 'translation_1', '' ),
		lastModified: get( translationDetails, 'date_modified', '' ),
	};
}

/**
 * Normalizes raw data from GP API
 *
 * @param {string} originalId GP original string id
 * @param {object} locale and item from `languages` array in config/_shared.json
 * @param {string} project GP project
 * @returns {string} the permalink to the translation on GlotPress
 */
export function getTranslationPermaLink( originalId, locale, project = GP_PROJECT ) {
	if ( ! originalId || ! locale ) {
		return null;
	}
	const urlBase = GP_BASE_URL + '/projects';
	const localeSlug = locale.parentLangSlug || locale.langSlug;
	const translationSetSlug = GP_PROJECT_TRANSLATION_SET_SLUGS[ locale.langSlug ] || 'default';
	return `${ urlBase }/${ project }/${ localeSlug }/${ translationSetSlug }?filters[original_id]=${ originalId }`;
}
