import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useUnsubscribeMutation } from 'calypso/data/site-profiler/use-unsubscribe-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	MessageDisplay,
	ErrorSecondLine,
} from 'calypso/performance-profiler/components/message-display';
import LoaderText from 'calypso/performance-profiler/components/weekly-report/loader-text';
import { WeeklyReportProps } from 'calypso/performance-profiler/types/weekly-report';

const Subtitle = styled.span`
	color: #a7aaad;
	font-size: 14px;
	font-weight: 400;
`;

export const WeeklyReportUnsubscribe = ( props: WeeklyReportProps ) => {
	const translate = useTranslate();
	const { url, hash } = props;

	const siteUrl = new URL( url );

	const { mutate, isPending, isError, isSuccess } = useUnsubscribeMutation( url, hash );

	useEffect( () => {
		mutate();
	}, [ mutate ] );

	useEffect( () => {
		if ( isSuccess ) {
			recordTracksEvent( 'calypso_performance_profiler_emails_unsubscribe', {
				url,
				hash,
			} );
		}
	}, [ isSuccess, url, hash ] );

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
				/>
			) }
			{ isSuccess && (
				<MessageDisplay
					displayBadge
					title={ translate( 'Farewell, friend' ) }
					message={ translate(
						'You’ll no longer receive performance reports for {{strong}}%s{{/strong}}{{br}}{{/br}}{{br}}{{/br}}{{subtitle}}If you ever change your mind, you can subscribe for {{br}}{{/br}}performance reports again from the results page.{{/subtitle}}',
						{
							args: [ siteUrl.host ],
							components: {
								strong: <strong />,
								br: <br />,
								subtitle: <Subtitle />,
							},
						}
					) }
					ctaText={ translate( 'Test a site' ) }
					ctaHref="/speed-test"
					ctaIcon="arrow-left"
				/>
			) }
		</div>
	);
};
