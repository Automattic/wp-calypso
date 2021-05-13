/**
 * External dependencies
 */
import { forEach } from 'lodash';
import i18n from 'i18n-calypso';

export default function detectSurveys( post, dom ) {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}

	const surveys = dom.querySelectorAll( '.pd-embed, .cs-embed' );

	if ( ! surveys ) {
		return post;
	}

	forEach( surveys, ( survey ) => {
		// Get survey details
		let surveyDetails = null;

		try {
			surveyDetails = JSON.parse( survey.getAttribute( 'data-settings' ) );
		} catch ( e ) {
			return;
		}

		const { domain: surveyDomain, id: surveySlug } = surveyDetails;

		if ( ! surveyDomain || ! surveySlug ) {
			return;
		}

		// Construct a survey link
		const p = document.createElement( 'p' );
		p.innerHTML =
			'<a target="_blank" rel="external noopener noreferrer" href="https://' +
			surveyDomain +
			surveySlug +
			'">' +
			i18n.translate( 'Take our survey' ) +
			'</a>';

		// Replace the .pd-embed div with the new paragraph
		survey.parentNode.replaceChild( p, survey );
	} );

	return post;
}
