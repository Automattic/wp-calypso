/** @format */
/**
 * External dependencies
 */
import request from 'superagent';
import { get, head } from 'lodash';

/**
 * Internal dependencies
 */
import {
	I18N_COMMUNITY_TRANSLATOR_TOGGLE_HIDE_DIALOG,
	I18N_COMMUNITY_TRANSLATOR_TOGGLE_SHOW_DIALOG,
	I18N_COMMUNITY_TRANSLATOR_STRING_RECEIVE,
} from 'state/action-types';

/**
 * Action creator function: I18N_COMMUNITY_TRANSLATOR_TOGGLE_SHOW_DIALOG
 *
 * @return {Object} action object
 */
export const showCommunityTranslatorDialog = () => {
	return {
		type: I18N_COMMUNITY_TRANSLATOR_TOGGLE_SHOW_DIALOG,
	};
};

/**
 * Action creator function: I18N_COMMUNITY_TRANSLATOR_TOGGLE_HIDE_DIALOG
 *
 * @return {Object} action object
 */
export const hideCommunityTranslatorDialog = () => {
	return {
		type: I18N_COMMUNITY_TRANSLATOR_TOGGLE_HIDE_DIALOG,
	};
};

/**
 * Action creator function: I18N_COMMUNITY_TRANSLATOR_TOGGLE_SHOW_DIALOG
 *
 * @return {Object} action object
 */
export const getTranslationData = ( locale, originalStringData ) => {
	// TODO: glotPressUrl & project should be constants and vary depending on NODE_ENV
	const glotPressUrl = 'https://translate.wordpress.com/api/translations/-query-by-originals';
	const project = 'test';
	const originalStringsValue = {
		project,
		locale_slug: locale,
		original_strings: originalStringData,
	};
	const postFormData = `project=${ project }&locale_slug=${ locale }&original_strings=${
		encodeURIComponent( JSON.stringify( originalStringsValue ) )
	}`;

	return dispatch => {
		return request
			.post( glotPressUrl )
			.withCredentials()
			.send( postFormData )
			.then( response => {
				const originalId = originalStringData.singular;
				const data = head( response.body ) || undefined;
				dispatch( {
					type: I18N_COMMUNITY_TRANSLATOR_STRING_RECEIVE,
					originalId,
					data,
				} );
			} );
	};
};
