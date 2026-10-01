import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { MessageDisplay } from 'calypso/performance-profiler/components/message-display';

export const WeeklyReportUnsubscribe = () => {
	const translate = useTranslate();

	return (
		<>
			<DocumentHead title={ translate( 'Speed Test weekly reports' ) } />
			<MessageDisplay
				displayBadge
				message={ translate(
					'Weekly performance reports have been discontinued. You won’t receive further emails.'
				) }
			/>
		</>
	);
};
