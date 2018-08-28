/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/*
	# Usage:

	## Client:

	import userAgent from 'lib/user-agent';

	const { isChromeOS, isIE } = userAgent;

	if ( isChromeOS && isIE ) {
		console.log( 'Hmm, this is unorthodox!' );
	}

	For a full list of values see: https://github.com/biggora/express-useragent/blob/master/lib/express-useragent.js#L191

 */
export default ( typeof window !== 'undefined' && !! get( window, 'app.userAgent', null )
	? window.app.userAgent
	: {} );
