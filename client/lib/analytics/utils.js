/**
 * Whether Do Not Track is enabled in the user's browser.
 *
 * @returns {Boolean} true if Do Not Track is enabled in the user's browser.
 */
function doNotTrack() {
	return '1' === navigator.doNotTrack;
}

/**
 * Whether the current URL can potentially contain personally identifiable info.
 *
 * @returns {Boolean} true if the current URL can potentially contain personally identifiable info.
 */
function isPiiUrl() {
	// If this list catches things that are not necessarily forbidden we're ok with
	// a little bit of approximation as long as we do catch the ones that we have to.
	// We need to be quite aggressive with how we filter candiate pages as failing
	// to protect our users' privacy puts us in breach of our own TOS and our
	// retargeting partners' TOS. We also see personally identifiable information in
	// unexpected places like email addresses in users' posts URLs and titles for
	// various (usually accidental) reasons. We also pass PII in URLs like
	// `wordpress.com/jetpack/connect` etc.
	const forbiddenPatterns = [
		'@',
		'%40',
		'first=',
		'last=',
		'email=',
		'email_address=',
		'user_email=',
		'address-1=',
		'country-code=',
		'phone=',
		'last-name=',
		'first-name=',
		'wordpress.com/jetpack/connect',
		'wordpress.com/error-report',
	];

	const href = document.location.href;

	for ( const pattern of forbiddenPatterns ) {
		if ( href.indexOf( pattern ) !== -1 ) {
			return true;
		}
	}

	return false;
}

module.exports = {
	doNotTrack: doNotTrack,
	isPiiUrl: isPiiUrl
};
