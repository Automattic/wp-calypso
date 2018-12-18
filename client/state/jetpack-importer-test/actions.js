/** @format */

/**
 * External dependencies
 */
import { includes, toLower } from 'lodash';

/**
 * Internal dependencies
 */

export const JP_TEST_URL_CHECK_SEND = 'JP_TEST_URL_CHECK_SEND';
export const JP_TEST_URL_CHECK_RECIEVE = 'JP_TEST_URL_CHECK_RECIEVE';
export const JP_TEST_START_OVER = 'JP_TEST_START_OVER';

// These are naive, but in reality detection will be the servers responsibility
const isWixURL = url => includes( toLower( url ), 'wix' );
const isWordPressURL = url => includes( toLower( url ), 'wordpress' );
const isBloggerURL = url => includes( toLower( url ), 'blogger' );
const isMediumURL = url => includes( toLower( url ), 'medium' );
const isSquareSpaceURL = url => includes( toLower( url ), 'squarespace' );

export const jpTestSubmitUrl = url => dispatch => {

	dispatch( {
		type: JP_TEST_URL_CHECK_SEND,
		url,
	} );

	const serviceResponse = isWixURL( url )
		? 'wix'
	: isWordPressURL( url )
		? 'wordpress'
	: isBloggerURL( url )
		? 'blogger'
	: isMediumURL( url )
		? 'medium'
	: isSquareSpaceURL( url )
		? 'squarespace'
	: 'unsupported';

	setTimeout( () => {

		dispatch( {
			type: JP_TEST_URL_CHECK_RECIEVE,
			service: serviceResponse,
		} );

	}, 400 );
}

export const startOver = () => ( {
	type: JP_TEST_START_OVER,
} );
