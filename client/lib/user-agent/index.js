/**
 * External dependencies
 */

import UserAgent from 'express-useragent';

/*
	# Clientside usage:

	```
	import userAgent from 'lib/user-agent';

	const { isChromeOS, isIE } = userAgent;

	if ( isChromeOS && isIE ) {
		console.log( 'Hmm, this is unorthodox!' );
	}
	```

	For a full list of values see: https://github.com/biggora/express-useragent/blob/master/lib/express-useragent.js#L191

	Note: we also import this lib server-side in server/boot/index.js
 */

export default UserAgent.parse( navigator.userAgent );
