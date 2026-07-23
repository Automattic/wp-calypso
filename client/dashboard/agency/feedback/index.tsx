import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { feedbackRoute } from '../../app/router/agency';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { getFeedbackConfig } from './config';
import FeedbackSurvey from './feedback-survey';
import useShowFeedback from './use-show-feedback';
import type { FeedbackType } from './types';

export default function EarnFeedback() {
	const { type, returnTo, email } = feedbackRoute.useSearch();
	const navigate = useNavigate();
	const config = getFeedbackConfig( type ?? '' );
	const fallback = returnTo || '/overview';

	const feedback = useShowFeedback( ( type ?? '' ) as FeedbackType );

	// Unknown/missing type, or the survey was already answered: leave.
	useEffect( () => {
		if ( ! config || feedback.isFeedbackShown ) {
			navigate( { to: fallback } );
		}
	}, [ config, feedback.isFeedbackShown, fallback, navigate ] );

	if ( ! config ) {
		return null;
	}

	const goBack = () => navigate( { to: fallback } );

	return (
		<PageLayout header={ <PageHeader title={ config.title } /> }>
			<FeedbackSurvey
				config={ config }
				description={ config.getDescription( { email } ) }
				isSubmitting={ feedback.isSubmitting }
				onSubmit={ ( responses ) => feedback.submit( responses, goBack ) }
				onSkip={ () => {
					feedback.skip();
					goBack();
				} }
			/>
		</PageLayout>
	);
}
