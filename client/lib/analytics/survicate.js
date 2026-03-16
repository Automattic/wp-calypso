import config from '@automattic/calypso-config';
import {
	shouldLoadSurvicate,
	loadSurvicateScript,
	isSurvicateScriptLoaded,
	setSurvicateVisitorTraits,
	getAccountAgeInDays,
	SURVICATE_WORKSPACE_ID,
} from '@automattic/survicate';
import { isMobile } from '@automattic/viewport';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';

export function mayWeLoadSurvicateScript() {
	return config( 'survicate_enabled' );
}

export function addSurvicate( { email, registrationDate } ) {
	if (
		! shouldLoadSurvicate( {
			locale: getLocaleSlug(),
			isMobile: !! isMobile(),
		} )
	) {
		return;
	}

	if ( ! mayWeLoadSurvicateScript() ) {
		return;
	}

	const setTraits = () => {
		setSurvicateVisitorTraits( {
			email,
			account_age_in_days: getAccountAgeInDays( registrationDate ),
		} );
	};

	if ( isSurvicateScriptLoaded() ) {
		setTraits();
		return;
	}

	loadSurvicateScript( SURVICATE_WORKSPACE_ID )
		.then( () => setTraits() )
		.catch( () => {} );
}

/**
 * Triggers the Help Center feedback survey and ensures the Survicate overlay
 * closes when the user clicks outside the modal.
 * This is needed as the Survicate overlay click doesn't close correctly.
 * See: https://a8c.slack.com/archives/C04H4NY6STW/p1766088738895199?thread_ts=1765290523.386849&cid=C04H4NY6STW
 */
export function showHelpCenterFeedbackSurvey() {
	const survicate = window._sva;

	if ( ! survicate?.invokeEvent ) {
		return;
	}

	const handleSurveyDisplayed = () => {
		const overlay = document.querySelector( '#survicate-box .sv__overlay' );

		if ( ! overlay ) {
			return;
		}

		const handleOverlayClick = () => {
			survicate.destroyVisitor?.();
		};

		overlay.addEventListener( 'click', handleOverlayClick, { once: true } );
		survicate.removeEventListener?.( 'survey_displayed', handleSurveyDisplayed );
	};

	survicate.addEventListener?.( 'survey_displayed', handleSurveyDisplayed );
	survicate.invokeEvent( 'showFeedbackSurveyFromHelpCenter' );
}
