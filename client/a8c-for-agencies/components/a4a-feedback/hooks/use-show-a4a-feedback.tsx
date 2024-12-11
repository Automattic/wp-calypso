import page from '@automattic/calypso-router';
import { removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import useUrlQueryParam from 'calypso/a8c-for-agencies/hooks/use-url-query-param';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from '../../../../state/preferences/selectors';
import { getA4AfeedbackProps } from '../lib/get-a4a-feedback-props';
import type { Props as A4AFeedbackProps } from '../index';
import type { FeedbackQueryData, FeedbackType, FeedbackProps } from '../types';

const FEEDBACK_URL_HASH_FRAGMENT = '#feedback';
const FEEDBACK_PREFERENCE = 'a4a-feedback';

const redirectToDefaultUrl = ( redirectUrl?: string ) => {
	if ( redirectUrl ) {
		page.redirect( redirectUrl );
		return;
	}
	page.redirect( removeQueryArgs( window.location.pathname + window.location.search, 'args' ) );
};

const getUpdatedPreference = (
	feedbackTimestamp: Record< string, Record< string, number > > | undefined,
	type: FeedbackType,
	paramType: string
) => {
	return {
		...( feedbackTimestamp ?? {} ),
		[ type ]: {
			...feedbackTimestamp?.[ type ],
			[ paramType ]: Date.now(),
		},
	};
};

const useShowFeedback = ( type: FeedbackType ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ feedbackInteracted, setFeedbackInteracted ] = useState( false );

	// Let's use hash #feedback if we want to show the feedback
	const feedbackFormHash = window.location.hash === FEEDBACK_URL_HASH_FRAGMENT;

	// Additional args, like email for invite flow
	const { value: args } = useUrlQueryParam( 'args' );

	// We are storing the timestamp when last feedback for given preference was submitted or skipped
	const feedbackTimestamp = useSelector( ( state ) => getPreference( state, FEEDBACK_PREFERENCE ) );

	const feedbackSubmitTimestamp = feedbackTimestamp?.[ type ]?.lastSubmittedAt;
	const feedbackSkipTimestamp = feedbackTimestamp?.[ type ]?.lastSkippedAt;

	// Checking if the feedback was submitted or skipped
	const showFeedback = useMemo( () => {
		return ! feedbackSubmitTimestamp && ! feedbackSkipTimestamp;
	}, [ feedbackSubmitTimestamp, feedbackSkipTimestamp ] );

	const feedbackProps: FeedbackProps = useMemo(
		() => getA4AfeedbackProps( type, translate, args ),
		[ type, translate, args ]
	);

	// Do the action when submitting feedback
	const onSubmitFeedback = useCallback(
		( data: FeedbackQueryData ) => {
			dispatch( recordTracksEvent( 'calypso_a4a_feedback_submit', { type } ) );
			if ( data ) {
				// TODO: Send feedback data to the backend
			}
			setFeedbackInteracted( true );
			const updatedPreference = getUpdatedPreference( feedbackTimestamp, type, 'lastSubmittedAt' );
			dispatch( savePreference( FEEDBACK_PREFERENCE, updatedPreference ) );
		},
		[ dispatch, feedbackTimestamp, type ]
	);

	// Do action when skipping feedback
	const onSkipFeedback = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_feedback_skip', { type } ) );
		const updatedPreference = getUpdatedPreference( feedbackTimestamp, type, 'lastSkippedAt' );
		setFeedbackInteracted( true );
		dispatch( savePreference( FEEDBACK_PREFERENCE, updatedPreference ) );
	}, [ dispatch, feedbackTimestamp, type ] );

	// Combine props passed to Feedback component
	const updatedFeedbackProps: A4AFeedbackProps = useMemo(
		() => ( {
			...feedbackProps,
			onSubmit: onSubmitFeedback,
			onSkip: onSkipFeedback,
		} ),
		[ feedbackProps, onSubmitFeedback, onSkipFeedback ]
	);

	if ( feedbackFormHash && ! showFeedback ) {
		// If the feedback form hash is present but we don't want to show the feedback form, redirect to the default URL
		// If feedback was interacted, redirect to the URL passed in the feedbackProps
		redirectToDefaultUrl( feedbackInteracted ? feedbackProps.redirectUrl : undefined );
	}

	return {
		isFeedbackShown: ! showFeedback,
		showFeedback: feedbackFormHash && showFeedback,
		feedbackProps: updatedFeedbackProps,
	};
};

export default useShowFeedback;
