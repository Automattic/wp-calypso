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
import { GP_PROJECT, GP_API_BASE_URL } from './constants';

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

export function postRequest( glotPressUrl, postFormData ) {
	return request
		.post( glotPressUrl )
		.withCredentials()
		.send( postFormData )
		.then( response => normalizeDetailsFromTranslationData( head( response.body ) ) )
		.catch( error => normalizeDetailsFromTranslationData( error ) );
}

export function getTranslationData(
	locale,
	originalStringData,
	apiBase = GP_API_BASE_URL,
	project = GP_PROJECT
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

	return postRequest( glotPressUrl, postFormData );
}

export function submitTranslation(
	originalId,
	translationObject,
	locale,
	apiBase = GP_API_BASE_URL,
	project = GP_PROJECT
) {
	const glotPressUrl = `${ apiBase }/translations/-new`;
	const newTranslations = Object.keys( translationObject )
		.map(
			key =>
				translationObject[ key ] &&
				`&translation[${ originalId }][]=${ encodeURIComponent( translationObject[ key ] ) }`
		)
		.join( '' );

	const postFormData = `project=${ project }&locale_slug=${ locale }${ newTranslations }`;
	return postRequest( glotPressUrl, postFormData );
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
		error: "Sorry, we couldn't find the translation information for this string.",
	};
}

export function getTranslationGlotPressUrl( originalId, locale, project = GP_PROJECT ) {
	if ( ! originalId || ! locale ) {
		return;
	}
	return `https://translate.wordpress.com/projects/${ project }/${ locale }/default?filters[original_id]=${ originalId }`;
}
