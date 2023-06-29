import { useDispatch, useSelector } from 'react-redux';
import { updateStatsNoticeStatusDirect } from 'calypso/state/sites/notices/actions';
import hasNewStatsFeedbackNotice from 'calypso/state/sites/selectors/has-new-stats-feedback-notice';
import hasOptOutNewStatsNotice from 'calypso/state/sites/selectors/has-opt-out-new-stats-notice';
import { FeedbackNoticeBody } from './feedback-notice';
import { OptOutNoticeBody } from './opt-out-notice';

export default function LegacyStatsNotices( { siteId } ) {
	const dispatch = useDispatch();

	const showOptOutNotice = useSelector( ( state ) => hasOptOutNewStatsNotice( state, siteId ) );
	const showFeedbackNotice = useSelector( ( state ) => hasNewStatsFeedbackNotice( state, siteId ) );

	const updateNewStatsFeedBackStats =
		( id, status, url = null, postponed_for = 0 ) =>
		() => {
			dispatch( updateStatsNoticeStatusDirect( siteId, id, status, postponed_for ) );
			if ( url ) {
				// Leave some time for the notice to be dismissed.
				setTimeout( () => ( window.location.href = url ), 250 );
			}
		};
	const onTakeSurveyClick = updateNewStatsFeedBackStats(
		'new_stats_feedback',
		'dismissed',
		'https://jetpack.com/redirect?source=new-jetpack-stats-usage-survey'
	);
	const onRemindMeLaterClick = updateNewStatsFeedBackStats(
		'new_stats_feedback',
		'postponed',
		null,
		30 * 24 * 3600
	);
	const dismissOptOutNotice = updateNewStatsFeedBackStats( 'opt_out_new_stats', 'dismissed' );
	const dismissFeedbackNotice = updateNewStatsFeedBackStats( 'new_stats_feedback', 'dismissed' );

	return (
		<>
			{ showOptOutNotice && <OptOutNoticeBody onNoticeDismiss={ dismissOptOutNotice } /> }
			{ showFeedbackNotice && (
				<FeedbackNoticeBody
					onTakeSurveyClick={ onTakeSurveyClick }
					onRemindMeLaterClick={ onRemindMeLaterClick }
					onNoticeDismiss={ dismissFeedbackNotice }
				/>
			) }
		</>
	);
}
