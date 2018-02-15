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

const PROJECT = 'test'; //wpcom
const GP_API_BASE_URL = 'https://translate.wordpress.com/api';

export function canDisplayCommunityTranslator( locale = userSettings.getSetting( 'language' ) ) {
	// restrict mobile devices from translator for now while we refine touch interactions
	if ( isMobile() ) {
		return false;
	}

	if ( 'en' === locale || ! locale ) {
		return false;
	}

	return true;
}

export function isCommunityTranslatorEnabled() {
	if ( ! userSettings.getSettings() || ! userSettings.getOriginalSetting( 'enable_translator' ) ) {
		return false;
	}

	// restrict mobile devices from translator for now while we refine touch interactions
	if ( ! canDisplayCommunityTranslator() ) {
		return false;
	}

	return true;
}

export function getTranslationData(
	locale,
	originalStringData,
	apiBase = GP_API_BASE_URL,
	project = PROJECT
) {
	// TODO: glotPressUrl & project should be constants and vary depending on NODE_ENV
	const glotPressUrl = `${ apiBase }/translations/-query-by-originals`;
	const originalStringsValue = {
		project,
		locale_slug: locale,
		original_strings: originalStringData,
	};
	const postFormData = `project=${ project }&locale_slug=${ locale }&original_strings=${ encodeURIComponent(
		JSON.stringify( originalStringsValue )
	) }`;

	return request
		.post( glotPressUrl )
		.withCredentials()
		.send( postFormData )
		.then( response => normalizeDetailsFromTranslationData( head( response.body ) ) )
		.catch( error => normalizeDetailsFromTranslationData( error ) );
}

export function submitTranslation(
	translation,
	locale,
	apiBase = GP_API_BASE_URL,
	project = PROJECT
) {
	const glotPressUrl = `${ apiBase }/translations/-new`;
	const postFormData = `project=${ project }&locale_slug=${ locale }&translation=${ encodeURIComponent(
		JSON.stringify( translation )
	) }`;
	return request
		.post( glotPressUrl )
		.withCredentials()
		.send( postFormData )
		.then( ( response ) => {
			// eslint-disable-next-line
			console.log( 'response.body', response.body );
		} );
}

export function normalizeDetailsFromTranslationData( glotPressData ) {
	if ( glotPressData && ! glotPressData.originals_not_found ) {
		const translationDetails = find( glotPressData.translations, {
			original_id: glotPressData.original_id,
		} );

		return {
			originalId: glotPressData.original_id,
			translatedSingular: get( translationDetails, 'translation_0', '' ),
			translatedPlural: get( translationDetails, 'translation_1', '' ),
			lastModified: get( translationDetails, 'date_modified', '' ),
		};
	}
	return {
		error: 'Sorry, we couldn\'t find the translation information for this string.',
	};
}

export function getTranslationGlotPressUrl( originalId, locale, project = PROJECT ) {
	return `https://translate.wordpress.com/projects/${ project }/${ locale }/default?filters[original_id]=${ originalId }`;
}
