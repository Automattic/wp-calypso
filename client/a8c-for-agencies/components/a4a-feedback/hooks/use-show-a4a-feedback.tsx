import page from '@automattic/calypso-router';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from '../../../../state/preferences/selectors';
import { Props as A4AFeedbackProps } from '../index';
import { getA4AfeedbackProps } from '../lib/get-a4a-feedback-props';
import { FeedbackQueryData, FeedbackType } from '../types';

const FEEDBACK_URL_HASH_FRAGMENT = '#feedback';
const FEEDBACK_SENT_PREFERENCE_PREFIX = 'a4a-feedback-sent__';

const redirectToDefaultUrl = ( redirectArgs: Record< string, string > ) => {
	const currentUrl = new URL( window.location.href );
	currentUrl.hash = '';
	currentUrl.search = '';
	page.redirect( addQueryArgs( currentUrl.toString(), redirectArgs ) );
};

const useShowFeedbackModal = ( type: FeedbackType ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	// Let's use hash #feedback if we want to show the feedback
	const feedbackFormHash = window.location.hash === FEEDBACK_URL_HASH_FRAGMENT;

	// Additional args, like email for invite flow
	const urlParams = new URLSearchParams( window.location.search );
	const args = JSON.parse( urlParams.get( 'args' ) ?? '{}' );
	const redirectArgs = JSON.parse( urlParams.get( 'redirectArgs' ) ?? '{}' );

	// Preference name, eg a4a-feedback-sent__referral-complete
	const preference = FEEDBACK_SENT_PREFERENCE_PREFIX + type;

	// We are storing the timestamp when last feedback for given preference was sent
	const feedbackTimestamp = useSelector( ( state ) => getPreference( state, preference ) );

	const feedbackSubmitTimestamp = feedbackTimestamp?.submitted;
	const feedbackSkipTimestamp = feedbackTimestamp?.skipped;

	// Checking if hash for feedback is present in the url and if it was more than 7 days ago since last feedback was sent
	const showFeedback = useMemo( () => {
		const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
		return (
			feedbackFormHash &&
			( ! feedbackSubmitTimestamp ||
				feedbackSubmitTimestamp < sevenDaysAgo ||
				! feedbackSkipTimestamp ||
				feedbackSkipTimestamp < sevenDaysAgo )
		);
	}, [ feedbackFormHash, feedbackSubmitTimestamp, feedbackSkipTimestamp ] );

	// Do the action when submitting feedback
	const onSubmitFeedback = useCallback(
		( data: FeedbackQueryData ) => {
			dispatch( savePreference( preference, { submitted: Date.now() } ) );
			if ( data ) {
				// TODO: Send feedback data to the backend
			}
			redirectToDefaultUrl( redirectArgs );
		},
		[ dispatch, preference, redirectArgs ]
	);

	// Do action when skipping feedback
	const onSkipFeedback = useCallback( () => {
		dispatch( savePreference( preference, { skipped: Date.now() } ) );
		redirectToDefaultUrl( redirectArgs );
	}, [ dispatch, preference, redirectArgs ] );

	// Combine props passed to Feedback component
	const feedbackProps: A4AFeedbackProps = useMemo(
		() => ( {
			...getA4AfeedbackProps( type, translate, args ),
			onSubmit: onSubmitFeedback,
			onSkip: onSkipFeedback,
		} ),
		[ type, onSubmitFeedback, onSkipFeedback, args, translate ]
	);

	// Some pages have banners and require url params
	// we need to find an elegant way to pass these.
	if ( feedbackFormHash && ! showFeedback ) {
		redirectToDefaultUrl( redirectArgs );
	}

	return {
		showFeedback,
		feedbackProps,
	};
};

export default useShowFeedbackModal;
