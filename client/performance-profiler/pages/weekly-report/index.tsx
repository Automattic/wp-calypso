import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useLeadMutation } from 'calypso/data/site-profiler/use-lead-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	MessageDisplay,
	ErrorSecondLine,
} from 'calypso/performance-profiler/components/message-display';
import LoaderText from 'calypso/performance-profiler/components/weekly-report/loader-text';
import { WeeklyReportProps } from 'calypso/performance-profiler/types/weekly-report';

export const WeeklyReport = ( props: WeeklyReportProps ) => {
	const translate = useTranslate();
	const { url, hash } = props;

	const siteUrl = new URL( url );

	const { mutate, isPending, isError, isSuccess } = useLeadMutation( url, hash );

	useEffect( () => {
		mutate();
	}, [ mutate ] );

	useEffect( () => {
		if ( isSuccess ) {
			recordTracksEvent( 'calypso_performance_profiler_emails_subscribe', {
				url,
				hash,
			} );
		}
	}, [ isSuccess, url, hash ] );

	const secondaryMessage = translate(
		'You can stop receiving performance reports at any time by clicking the Unsubscribe link in the email footer.'
	);

	return (
		<div className="peformance-profiler-weekly-report-container">
			<DocumentHead title={ translate( 'Speed Test weekly reports' ) } />

			{ isPending && (
				<MessageDisplay
					displayBadge
					message={
						<LoaderText>
							{ translate( 'Enabling email reports for %s', {
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
							{ translate( 'Email reports could not be enabled for %s', {
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
					ctaText={ translate( 'Enable email reports' ) }
					ctaHref={ `/speed-test-tool/weekly-report?url=${ url }&hash=${ hash }` }
					secondaryMessage={ secondaryMessage }
				/>
			) }
			{ isSuccess && (
				<MessageDisplay
					displayBadge
					title={ translate( 'You’re all set!' ) }
					message={ translate(
						'We‘ll send you a weekly performance report for {{strong}}%s{{/strong}} so you can keep an eye on your site‘s speed. Your first report will arrive next week.',
						{ args: [ siteUrl.host ], components: { strong: <strong /> } }
					) }
					ctaText={ translate( '← Back to speed test' ) }
					ctaHref={ `/speed-test-tool?url=${ url }&hash=${ hash }` }
					ctaIcon="arrow-left"
					secondaryMessage={ secondaryMessage }
				/>
			) }
		</div>
	);
};
