/** @format */

/**
 * External dependencies
 */
// import { forEach } from 'lodash';
// import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
//import { domForHtml } from './utils';

export default function detectSurveys( post, dom ) {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}

	return post;
}
