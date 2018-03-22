/** @format */

/**
 * External dependencies
 */
import request from 'superagent';
import { head, find, get } from 'lodash';

/**
 * Internal dependencies
 */
import userSettings from 'lib/user-settings';
import { isMobile } from 'lib/viewport';
import { GP_PROJECT, GP_BASE_URL, GP_PROJECT_TRANSLATION_SET_SLUGS } from './constants';
import { hasTranslationSet } from 'lib/i18n-utils';

/**
 * Checks whether the CT can be displayed, that is, if the chosen locale and device allow it
 * @param {String} locale user's localeSlug
 * @param {Object} localeVariant user's localeVariant slug (if any)
 * @returns {Boolean} whether the CT can be displayed
 */
export function canDisplayCommunityTranslator(
	locale = userSettings.getSetting( 'language' ),
	localeVariant = userSettings.getSetting( 'locale_variant' )
) {
	// restrict mobile devices from translator for now while we refine touch interactions
	if ( isMobile() ) {
		return false;
	}

	// disable for locales
	if ( ! locale || ! hasTranslationSet( locale ) ) {
		return false;
	}

	// disable for locale variants with no official GP translation sets
	if ( localeVariant && ! hasTranslationSet( localeVariant ) ) {
		return false;
	}

	return true;
}

/**
 * Checks whether the CT is enabled, that is, if
 * 1) the user has chosen to enable it,
 * 2) it can be displayed based on the user's language and device settings
 * @returns {Bool} whether the CT should be enabled
 */
export function isCommunityTranslatorEnabled() {
	if ( ! userSettings.getSettings() || ! userSettings.getOriginalSetting( 'enable_translator' ) ) {
		return false;
	}

	if ( ! canDisplayCommunityTranslator() ) {
		return false;
	}

	return true;
}

/**
 * Sends the POST request
 * @param {String} glotPressUrl API url
 * @param {String} postFormData post data url param string
 * @returns {Object} request object
 */
export function postRequest( glotPressUrl, postFormData ) {
	return request
		.post( glotPressUrl )
		.withCredentials()
		.send( postFormData )
		.then( response => normalizeDetailsFromTranslationData( head( response.body ) ) )
		.catch( error => normalizeDetailsFromTranslationData( error ) );
}

/**
 * Prepares and triggers a request to get GP string
 * @param {Object} locale and item from `languages` array in config/_shared.json
 * @param {Object} originalStringData GP string information { singular, context, plural }
 * @param {String} apiBaseUrl Base API url to get translations
 * @param {String} project GP project
 * @param {Function} post see postRequest()
 * @returns {Object} request object
 */
export function getTranslationData(
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

	return post( glotPressUrl, postFormData.join( '' ) );
}

/**
 * Prepares and triggers a request to get GP string
 * @param {String} originalId GP original string id
 * @param {Object} translationObject GP string information { singular, context, plural }
 * @param {Object} locale and item from `languages` array in config/_shared.json
 * @param {String} apiBaseUrl Base API url to get translations
 * @param {String} project GP project
 * @param {Function} post see postRequest()
 * @returns {Object} request object
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
			key =>
				translationObject[ key ] &&
				`&translation[${ originalId }][]=${ encodeURIComponent( translationObject[ key ] ) }`
		),
	];

	return post( glotPressUrl, postFormData.join( '' ) );
}

/**
 * Normalizes raw data from GP API
 * @param {Object} glotPressData raw API response
 * @returns {Object} normalized data or error object
 */
export function normalizeDetailsFromTranslationData( glotPressData ) {
	if ( glotPressData && ! glotPressData.originals_not_found ) {
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
	return {
		error: "Sorry, we couldn't find the translation information for this string.",
	};
}

/**
 * Normalizes raw data from GP API
 * @param {String} originalId GP original string id
 * @param {Object} locale and item from `languages` array in config/_shared.json
 * @param {String} project GP project
 * @returns {String} the permalink to the translation on GlotPress
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
