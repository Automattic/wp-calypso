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

	For a full list of values see: https://github.com/biggora/express-useragent/blob/a212152c802d355c623b72d7b6b4c7af2726d312/src/express-useragent.ts#L171

	Note: we also import this lib server-side in server/boot/index.js
 */
export default UserAgent.parse( typeof window !== 'undefined' ? window.navigator.userAgent : '' );
