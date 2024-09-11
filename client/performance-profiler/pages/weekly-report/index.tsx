import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useLeadMutation } from 'calypso/data/site-profiler/use-lead-query';
import {
	MessageDisplay,
	ErrorSecondLine,
} from 'calypso/performance-profiler/components/message-display';

type WeeklyReportProps = {
	url: string;
	hash: string;
};

const LoaderText = styled.span`
	display: flex;
	align-items: center;
	font-size: 16px;
	font-weight: 400;
	line-height: 24px;
	position: relative;

	&:before {
		content: '';
		display: inline-block;
		border-radius: 50%;
		margin-right: 10px;
		content: '';
		width: 16px;
		height: 16px;
		border: solid 2px #074ee8;
		border-radius: 50%;
		border-bottom-color: transparent;
		-webkit-transition: all 0.5s ease-in;
		-webkit-animation-name: rotate;
		-webkit-animation-duration: 1s;
		-webkit-animation-iteration-count: infinite;
		-webkit-animation-timing-function: linear;

		transition: all 0.5s ease-in;
		animation-name: rotate;
		animation-duration: 1s;
		animation-iteration-count: infinite;
		animation-timing-function: linear;
	}

	@keyframes rotate {
		from {
			transform: rotate( 0deg );
		}
		to {
			transform: rotate( 360deg );
		}
	}

	@-webkit-keyframes rotate {
		from {
			-webkit-transform: rotate( 0deg );
		}
		to {
			-webkit-transform: rotate( 360deg );
		}
	}
`;

export const WeeklyReport = ( props: WeeklyReportProps ) => {
	const translate = useTranslate();
	const { url, hash } = props;

	const siteUrl = new URL( url );

	const { mutate, isPending, isError, isSuccess } = useLeadMutation( url, hash );

	useEffect( () => {
		mutate();
	}, [ mutate ] );

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
						'We‘ll send you a weekly performance report for {{strong}}%s{{/strong}} so you can keep an eye on your site‘s speed. The first email is on it‘s way now.',
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
