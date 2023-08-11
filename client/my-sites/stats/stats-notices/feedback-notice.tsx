import NoticeBanner from '@automattic/components/src/notice-banner';
import { useTranslate } from 'i18n-calypso';
import { FeedbackNoticeBodyProps } from './types';

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
