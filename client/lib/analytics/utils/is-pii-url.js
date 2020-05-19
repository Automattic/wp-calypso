/**
 * Internal dependencies
 */
import debug from './debug';

// If this list catches things that are not necessarily forbidden we're ok with
// a little bit of approximation as long as we do catch the ones that we have to.
// We need to be quite aggressive with how we filter candiate pages as failing
// to protect our users' privacy puts us in breach of our own TOS and our
// retargeting partners' TOS. We also see personally identifiable information in
// unexpected places like email addresses in users' posts URLs and titles for
// various (usually accidental) reasons. We also pass PII in URLs like
// `wordpress.com/jetpack/connect` and `wordpress.com/error-report`.
const forbiddenPiiPatterns = [
	'@',
	'email=',
	'email_address=',
	'first=',
	'last=',
	'first-name=',
	'last-name=',
	'address-1=',
	'phone=',
];

const forbiddenPiiPatternsEnc = forbiddenPiiPatterns.map( ( pattern ) => {
	return encodeURIComponent( pattern );
} );

/**
 * Whether the current URL can potentially contain personally identifiable info.
 *
 * @returns {boolean} true if the current URL can potentially contain personally identifiable info.
 */
export default function isPiiUrl() {
	const href = document.location.href;
	const match = ( pattern ) => href.indexOf( pattern ) !== -1;
	const result = forbiddenPiiPatterns.some( match ) || forbiddenPiiPatternsEnc.some( match );

	debug( `Is PII URL: ${ result }` );
	return result;
}
