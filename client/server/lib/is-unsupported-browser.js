import { matchesUA } from 'browserslist-useragent';

/**
 * This is a list of browsers which DEFINITELY do not work on WordPress.com.
 *
 * I created this list by finding the oldest version of Chrome which supports the
 * log-in page, and then finding which language feature was added in that release.
 *
 * In this case, the feature was optional chaining, which we use in our bundle,
 * but is not supported by these browsers. As a result, these browsers do not
 * work with the WordPress.com login page. See https://caniuse.com/?search=optional%20chaining.
 *
 * In other words, if you use Chrome v79, you won't be able to log in. But if you
 * use v80, the form works.
 *
 * For browsers not listed, we have not tested whether they work.
 *
 * Importantly, browsers are only completely supported if they fall within the range
 * listed in package.json. This list only serves as a way to assist users who are
 * using a browser which is definitely broken. It is not a guarantee that things
 * will work flawlessly on newer versions.
 */
const UNSUPPORTED_BROWSERS = [
	'ie <= 11',
	'edge <= 79',
	'firefox <= 73',
	'chrome <= 79',
	'safari <= 13', // Note: 13.1 IS supported. Browserslist considers Safari point releases as new versions.
	'opera <= 66',
	'ios <= 13.3',
];

export default function isUnsupportedBrowser( req ) {
	// The desktop app sends a UserAgent including WordPress, Electron and Chrome.
	// We need to check if the chrome portion is supported, but the UA library
	// will select WordPress and Electron before Chrome, giving a result not
	// based on the chrome version.
	const userAgentString = req.useragent.source;
	const sanitizedUA = userAgentString.replace( / (WordPressDesktop|Electron)\/[.\d]+/g, '' );
	return matchesUA( sanitizedUA, { ignoreMinor: true, browsers: UNSUPPORTED_BROWSERS } );
}
