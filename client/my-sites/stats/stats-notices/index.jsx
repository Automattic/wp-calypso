import NoticeBanner from '@automattic/components/src/notice-banner';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import { updateStatsNoticeStatusDirect } from 'calypso/state/sites/notices/actions';
import hasNewStatsFeedbackNotice from 'calypso/state/sites/selectors/has-new-stats-feedback-notice';
import hasOptOutNewStatsNotice from 'calypso/state/sites/selectors/has-opt-out-new-stats-notice';

import './style.scss';

export default function StatsNotices( { siteId } ) {
	const translate = useTranslate();
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
			{ showOptOutNotice && (
				<div className="inner-notice-container has-background-color">
					<NoticeBanner
						level="success"
						title={ translate( 'Welcome to the new Jetpack Stats!' ) }
						onClose={ dismissOptOutNotice }
					>
						{ translate(
							'{{p}}Enjoy a more modern and mobile friendly experience with new stats and insights to help you grow your site.{{/p}}{{p}}If you prefer to continue using the traditional stats, {{manageYourSettingsLink}}manage your settings{{/manageYourSettingsLink}}.{{/p}}',
							{
								components: {
									p: <p />,
									manageYourSettingsLink: (
										<a href="/wp-admin/admin.php?page=jetpack#/settings?term=stats" />
									),
								},
							}
						) }
					</NoticeBanner>
				</div>
			) }
			{ showFeedbackNotice && (
				<div className="inner-notice-container has-background-color">
					<NoticeBanner
						level="info"
						title={ translate( "We'd love to hear your thoughts on the new Stats" ) }
						onClose={ dismissFeedbackNotice }
					>
						{ translate(
							"{{p}}Now that you've gotten familiar with the new Jetpack Stats, we'd love to hear about your experience so we can continue to shape Jetpack to meet your needs.{{/p}}{{p}}{{takeSurveyButton}}Take quick survey{{/takeSurveyButton}} {{remindMeLaterLink}}Remind me later{{/remindMeLaterLink}}{{/p}}",
							{
								components: {
									p: <p />,
									takeSurveyButton: (
										<button
											type="button"
											className="notice-banner__action-button"
											onClick={ onTakeSurveyClick }
										/>
									),
									remindMeLaterLink: (
										<button
											className="notice-banner__action-link"
											onClick={ onRemindMeLaterClick }
										/>
									),
								},
							}
						) }
					</NoticeBanner>
				</div>
			) }
		</>
	);
}
