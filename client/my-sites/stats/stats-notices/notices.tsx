import { useState } from 'react';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import useNoticeVisibilityQuery from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import FeedbackNoticeBody from './feedback-notice';
import OptOutNoticeBody from './opt-out-notice';

interface StatsNoticesProps {
	siteId: number | null;
	isOdysseyStats: boolean;
}

interface StatsNoticeProps {
	siteId: number | null;
}

const OptOutNotice = ( { siteId }: StatsNoticeProps ) => {
	const [ noticeDismissed, setNoticeDismissed ] = useState( false );
	const { data: showOptOutNotice } = useNoticeVisibilityQuery( siteId, 'opt_out_new_stats' );
	const { mutateAsync: dismissOptOutNoticeAsync } = useNoticeVisibilityMutation(
		siteId,
		'opt_out_new_stats'
	);
	const dismissOptOutNotice = () => {
		setNoticeDismissed( true );
		dismissOptOutNoticeAsync();
	};

	return ! noticeDismissed && showOptOutNotice ? (
		<OptOutNoticeBody onNoticeDismiss={ dismissOptOutNotice } />
	) : null;
};

const FeedbackNotice = ( { siteId }: StatsNoticeProps ) => {
	const [ noticeDismissed, setNoticeDismissed ] = useState( false );
	const { data: showFeedbackNotice } = useNoticeVisibilityQuery( siteId, 'new_stats_feedback' );

	const { mutateAsync: dismissNewStatsFeedbackAsync } = useNoticeVisibilityMutation(
		siteId,
		'new_stats_feedback'
	);
	const { mutateAsync: dismissFeedbackNoticeAsync } = useNoticeVisibilityMutation(
		siteId,
		'new_stats_feedback'
	);
	const { mutateAsync: postponeNewStatsFeedbackAsync } = useNoticeVisibilityMutation(
		siteId,
		'new_stats_feedback',
		'postponed',
		30 * 24 * 3600
	);
	const onTakeSurveyClick = () => {
		dismissNewStatsFeedbackAsync();
		// Leave some time for the notice to be dismissed.
		setTimeout(
			() =>
				( window.location.href =
					'https://jetpack.com/redirect?source=new-jetpack-stats-usage-survey' ),
			250
		);
	};
	const dismissFeedbackNotice = () => {
		setNoticeDismissed( true );
		dismissFeedbackNoticeAsync();
	};

	const onRemindMeLaterClick = () => {
		setNoticeDismissed( true );
		postponeNewStatsFeedbackAsync();
	};

	return ! noticeDismissed && showFeedbackNotice ? (
		<FeedbackNoticeBody
			onTakeSurveyClick={ onTakeSurveyClick }
			onRemindMeLaterClick={ onRemindMeLaterClick }
			onNoticeDismiss={ dismissFeedbackNotice }
		/>
	) : null;
};

/**
 * New notices aim to support Calypso and Odyssey stats.
 * New notices are based on async API call and hence is faster than the old notices.
 */
const StatsNotices = ( { siteId, isOdysseyStats }: StatsNoticesProps ) => {
	return (
		<>
			{ isOdysseyStats && <OptOutNotice siteId={ siteId } /> }
			{ isOdysseyStats && <FeedbackNotice siteId={ siteId } /> }
		</>
	);
};

export default StatsNotices;
