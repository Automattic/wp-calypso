/** @format */

/**
 * External dependencies
 */

import { UserAgent } from 'express-useragent';
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
export default ( typeof window !== 'undefined' && !! get( window, 'navigator.userAgent', null )
	? new UserAgent().parse( window.navigator.userAgent )
	: {} );
