/**
 * External dependencies
 */
import { throttle } from 'lodash';

/**
 * Internal dependencies
 */
import {
	COMMUNITY_TRANSLATOR_TRANSLATION_DATA_REQUEST,
	COMMUNITY_TRANSLATOR_TRANSLATION_DATA_RECEIVE,
} from 'state/action-types';
import { getOriginalKey, getTranslationsData } from 'components/community-translator/utils';

import 'state/community-translator/init';

const translationRequestsQueue = [];

export const fetchTranslationsData = throttle(
	( locale, dispatch ) => {
		const originals = translationRequestsQueue.splice( 0, translationRequestsQueue.length );
		dispatch( { type: COMMUNITY_TRANSLATOR_TRANSLATION_DATA_REQUEST, payload: originals } );

		getTranslationsData( locale, originals ).then( ( data ) => {
			const translationsData = originals.reduce( ( acc, original ) => {
				const key = getOriginalKey( original );
				acc[ key ] = data[ key ] || null;

				return acc;
			}, {} );

			dispatch( {
				type: COMMUNITY_TRANSLATOR_TRANSLATION_DATA_RECEIVE,
				payload: translationsData,
			} );
		} );
	},
	100,
	{
		leading: false,
	}
);

export const requestTranslationData = ( locale, originalData ) => ( dispatch ) => {
	translationRequestsQueue.push( originalData );
	fetchTranslationsData( locale, dispatch );
};

// export const requestTranslationData = () => ( dispatch, ...rest ) => ( { type: 'ASD' } );
