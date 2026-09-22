import debugFactory from 'debug';
import i18n from 'i18n-calypso';
import { externalLinkParagraph } from './utils';

const debug = debugFactory( 'calypso:post-normalizer:detect-surveys' );

// Crowdsignal serves surveys from these hosts, and from per-account subdomains of them.
const surveyHosts = [
	'crowdsignal.com',
	'crowdsignal.net',
	'poll.fm',
	'polldaddy.com',
	'survey.fm',
];

/**
 * Turns the `domain` and `id` of a Crowdsignal embed into a survey URL, or null when the
 * pair does not describe one. `data-settings` is author-controlled and survives server-side
 * sanitization as opaque JSON, so nothing in it can be trusted.
 * @param {string} domain Host portion of the survey URL, e.g. `example.survey.fm/`
 * @param {string} slug Path portion of the survey URL
 * @returns {string|null} The survey URL, or null
 */
function surveyUrl( domain, slug ) {
	if ( typeof domain !== 'string' || typeof slug !== 'string' ) {
		return null;
	}

	let url;
	try {
		url = new URL( 'https://' + domain + slug );
	} catch {
		return null;
	}

	if ( url.username || url.password ) {
		return null;
	}

	const host = url.hostname.toLowerCase();
	const isSurveyHost = surveyHosts.some(
		( allowedHost ) => host === allowedHost || host.endsWith( '.' + allowedHost )
	);

	return isSurveyHost ? url.href : null;
}

export default function detectSurveys( post, dom ) {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}

	const surveys = dom.querySelectorAll( '.pd-embed, .cs-embed' );

	if ( ! surveys ) {
		return post;
	}

	Array.from( surveys ).forEach( ( survey ) => {
		// Get survey details
		let surveyDetails = null;

		try {
			surveyDetails = JSON.parse( survey.getAttribute( 'data-settings' ) );
		} catch ( error ) {
			debug( 'unreadable survey settings; leaving the embed alone', error );
			return;
		}

		const { domain: surveyDomain, id: surveySlug } = surveyDetails ?? {};

		if ( ! surveyDomain || ! surveySlug ) {
			return;
		}

		const href = surveyUrl( surveyDomain, surveySlug );

		// Leave the embed alone when the URL is not one we can vouch for. Its `div` form then
		// renders as nothing, which beats linking somewhere arbitrary.
		if ( ! href ) {
			debug( 'not a Crowdsignal survey URL; leaving the embed alone', surveyDomain, surveySlug );
			return;
		}

		// Replace the .pd-embed div with a paragraph linking to the survey
		survey.parentNode.replaceChild(
			externalLinkParagraph( href, i18n.translate( 'Take our survey' ) ),
			survey
		);
	} );

	return post;
}
