import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useUnsubscribeMutation } from 'calypso/data/site-profiler/use-unsubscribe-query';
import {
	MessageDisplay,
	ErrorSecondLine,
} from 'calypso/performance-profiler/components/message-display';
import LoaderText from 'calypso/performance-profiler/components/weekly-report/loader-text';
import { WeeklyReportProps } from 'calypso/performance-profiler/types/weekly-report';

export const WeeklyReportUnsubscribe = ( props: WeeklyReportProps ) => {
	const translate = useTranslate();
	const { url, hash } = props;

	const siteUrl = new URL( url );

	const { mutate, isPending, isError, isSuccess } = useUnsubscribeMutation( url, hash );

	useEffect( () => {
		mutate();
	}, [ mutate ] );

	const secondaryMessage = translate(
		'You can always resubscribe to receive performance change emails by opting in again for weekly reports at any time.'
	);

	return (
		<div className="peformance-profiler-weekly-report-container">
			<DocumentHead title={ translate( 'Speed Test weekly reports' ) } />

			{ isPending && (
				<MessageDisplay
					displayBadge
					message={
						<LoaderText>
							{ translate( 'Unsubscribing email alerts for %s', {
								args: [ siteUrl.host ],
							} ) }
						</LoaderText>
					}
					secondaryMessage={ secondaryMessage }
				/>
			) }
			{ isError && (
				<MessageDisplay
					isErrorMessage
					displayBadge
					message={
						<>
							{ translate( 'Failed to unsubscribe from email alerts for %s', {
								args: [ siteUrl.host ],
							} ) }
							<br />
							<ErrorSecondLine>
								{ translate(
									'Please try again or contact support if you continue to experience problems.'
								) }
							</ErrorSecondLine>
						</>
					}
					secondaryMessage={ secondaryMessage }
				/>
			) }
			{ isSuccess && (
				<MessageDisplay
					displayBadge
					title={ translate( 'Unsubscribed!' ) }
					message={ translate(
						'You‘ll no longer receive weekly performance report for {{strong}}%s{{/strong}}',
						{ args: [ siteUrl.host ], components: { strong: <strong /> } }
					) }
					ctaText={ translate( '← Back to speed test' ) }
					ctaHref="/speed-test"
					ctaIcon="arrow-left"
					secondaryMessage={ secondaryMessage }
				/>
			) }
		</div>
	);
};
