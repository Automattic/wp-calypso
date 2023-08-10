import NoticeBanner from '@automattic/components/src/notice-banner';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import useNoticeVisibilityQuery from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { StatsNoticeProps, FeedbackNoticeBodyProps } from './types';

export const FeedbackNoticeBody = ( {
	onTakeSurveyClick,
	onRemindMeLaterClick,
	onNoticeDismiss,
}: FeedbackNoticeBodyProps ) => {
	const translate = useTranslate();

	return (
		<div className="inner-notice-container has-odyssey-stats-bg-color">
			<NoticeBanner
				level="info"
				title={ translate( "We'd love to hear your thoughts on the new Stats" ) }
				onClose={ onNoticeDismiss }
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
								<button className="notice-banner__action-link" onClick={ onRemindMeLaterClick } />
							),
						},
					}
				) }
			</NoticeBanner>
		</div>
	);
};

const FeedbackNotice = ( { siteId }: StatsNoticeProps ) => {
	const [ noticeDismissed, setNoticeDismissed ] = useState( false );
	const { data: showFeedbackNotice } = useNoticeVisibilityQuery( siteId, 'new_stats_feedback' );

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
		dismissFeedbackNoticeAsync();
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

	if ( noticeDismissed || ! showFeedbackNotice ) {
		return null;
	}

	return (
		<FeedbackNoticeBody
			onTakeSurveyClick={ onTakeSurveyClick }
			onRemindMeLaterClick={ onRemindMeLaterClick }
			onNoticeDismiss={ dismissFeedbackNotice }
		/>
	);
};

export default FeedbackNotice;
