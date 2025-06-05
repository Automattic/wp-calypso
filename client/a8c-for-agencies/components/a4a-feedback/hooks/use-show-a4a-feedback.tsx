import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useUrlQueryParam from 'calypso/a8c-for-agencies/hooks/use-url-query-param';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from '../../../../state/preferences/selectors';
import { A4A_OVERVIEW_LINK, A4A_FEEDBACK_LINK } from '../../sidebar-menu/lib/constants';
import { getA4AfeedbackProps } from '../lib/get-a4a-feedback-props';
import useSaveFeedbackMutation from './use-save-feedback-mutation';
import type {
	FeedbackQueryData,
	FeedbackType,
	FeedbackProps,
	FeedbackSurveyResponsesPayload,
} from '../types';

const FEEDBACK_PREFERENCE = 'a4a-feedback';
const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

const redirectToDefaultUrl = ( redirectUrl?: string ) => {
	if ( redirectUrl ) {
		page.redirect( redirectUrl );
		return;
	}
	page.redirect( A4A_OVERVIEW_LINK );
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

const isWithinSevenDays = ( date: string ): boolean => {
	const startDate = new Date( date ).getTime();
	const currentDate = Date.now();
	const diffInMs = Math.abs( currentDate - startDate );
	return diffInMs <= SEVEN_DAYS_IN_MS;
};

const useShowFeedback = ( type: FeedbackType, startDate?: string | null ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ feedbackInteracted, setFeedbackInteracted ] = useState( false );

	const { mutate: saveFeedback, isPending, data: apiResponseData } = useSaveFeedbackMutation();

	// Check if the current page is the feedback page
	const isFeedbackPage = window.location.pathname === A4A_FEEDBACK_LINK;

	// Additional args, like email for invite flow
	const { value: args } = useUrlQueryParam( 'args' );
	const { value: redirectUrlFromQueryParam } = useUrlQueryParam( 'redirectUrl' );

	// We are storing the timestamp when last feedback for given preference was submitted or skipped
	const feedbackTimestamp = useSelector( ( state ) => getPreference( state, FEEDBACK_PREFERENCE ) );

	const feedbackSubmitTimestamp = feedbackTimestamp?.[ type ]?.lastSubmittedAt;
	const feedbackSkipTimestamp = feedbackTimestamp?.[ type ]?.lastSkippedAt;

	// Checking if the feedback was submitted or skipped and if we're within the date window
	const showFeedback = useMemo( () => {
		const hasNotInteracted = ! feedbackSubmitTimestamp && ! feedbackSkipTimestamp;
		const isWithinDateWindow = startDate ? isWithinSevenDays( startDate ) : true;
		return hasNotInteracted && isWithinDateWindow;
	}, [ feedbackSubmitTimestamp, feedbackSkipTimestamp, startDate ] );

	const feedbackProps: FeedbackProps = useMemo(
		() => getA4AfeedbackProps( type, translate, args ),
		[ type, translate, args ]
	);

	const agencyId = useSelector( getActiveAgencyId );

	// Do the action when submitting feedback
	const onSubmitFeedback = useCallback(
		( data: FeedbackQueryData ) => {
			if ( ! data || ! agencyId ) {
				return;
			}
			const { experience, comments, suggestions } = data;
			const params: FeedbackSurveyResponsesPayload = {
				site_id: agencyId,
				survey_id: type,
				survey_responses: {
					rating: experience,
					comment: { text: comments },
					suggestions: { text: suggestions?.join( ', ' ) || '' },
				},
			};

			dispatch(
				recordTracksEvent( 'calypso_a4a_feedback_submit', {
					agency_id: agencyId,
					survey_id: params.survey_id,
					rating: params.survey_responses.rating,
					suggestions: params.survey_responses.suggestions?.text,
					comment: params.survey_responses.comment?.text,
				} )
			);
			saveFeedback( { params } );

			setFeedbackInteracted( true );
			const updatedPreference = getUpdatedPreference( feedbackTimestamp, type, 'lastSubmittedAt' );
			dispatch( savePreference( FEEDBACK_PREFERENCE, updatedPreference ) );
		},

		[ agencyId, dispatch, feedbackTimestamp, saveFeedback, type ]
	);

	// Do action when skipping feedback
	const onSkipFeedback = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_feedback_skip', { type } ) );
		const updatedPreference = getUpdatedPreference( feedbackTimestamp, type, 'lastSkippedAt' );
		setFeedbackInteracted( true );
		dispatch( savePreference( FEEDBACK_PREFERENCE, updatedPreference ) );
	}, [ dispatch, feedbackTimestamp, type ] );

	// Combine props passed to Feedback component
	const updatedFeedbackProps = useMemo(
		() => ( {
			...feedbackProps,
			onSubmit: onSubmitFeedback,
			onSkip: onSkipFeedback,
		} ),
		[ feedbackProps, onSubmitFeedback, onSkipFeedback ]
	);

	useEffect( () => {
		if ( apiResponseData?.success ) {
			// Show success notice
			dispatch(
				successNotice(
					translate(
						'Thanks! Our team will use your feedback to help prioritize improvements to Automattic for Agencies.'
					),
					{
						displayOnNextPage: true,
						id: 'submit-product-feedback-success',
						duration: 10000,
					}
				)
			);
		}

		if ( isFeedbackPage && ! showFeedback && ! isPending ) {
			// If the feedback form hash is present but we don't want to show the feedback form, redirect to the default URL
			// If feedback was interacted, redirect to the URL passed in the feedbackProps
			redirectToDefaultUrl(
				redirectUrlFromQueryParam || ( feedbackInteracted ? feedbackProps.redirectUrl : undefined )
			);
		}
	}, [
		apiResponseData,
		dispatch,
		isFeedbackPage,
		feedbackInteracted,
		feedbackProps,
		isPending,
		redirectUrlFromQueryParam,
		showFeedback,
		translate,
	] );

	return {
		isFeedbackShown: ! showFeedback,
		showFeedback: isFeedbackPage && showFeedback,
		feedbackProps: updatedFeedbackProps,
		isSubmitting: isPending,
	};
};

export default useShowFeedback;
