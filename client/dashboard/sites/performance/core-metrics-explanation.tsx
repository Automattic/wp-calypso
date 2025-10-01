import { Metrics } from '@automattic/api-core';
import { localizeUrl } from '@automattic/i18n-utils';
import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Text } from '../../components/text';

const metricsExplanations = {
	fcp: {
		explanation: createInterpolateElement(
			/* translators: %(learnMore)s is the learn more link */
			__(
				'First Contentful Paint reflects the time it takes to display the first text or image to visitors. The best sites load in under 1.8 seconds. <learnMore>Learn more</learnMore>'
			),
			{
				learnMore: (
					<ExternalLink
						href={ localizeUrl(
							'https://developer.wordpress.com/docs/site-performance/speed-test/#first-contentful-paint-fcp-'
						) }
					>
						{ __( 'Learn more' ) }
					</ExternalLink>
				),
			}
		),
	},
	lcp: {
		explanation: createInterpolateElement(
			/* translators: %(learnMore)s is the learn more link */
			__(
				'Largest Contentful Paint measures the time it takes for the largest visible element (like an image or text block) on a page to load. The best sites load in under 2.5 seconds. <learnMore>Learn more</learnMore>'
			),
			{
				learnMore: (
					<ExternalLink
						href={ localizeUrl(
							'https://developer.wordpress.com/docs/site-performance/speed-test/#largest-contentful-paint-lcp-'
						) }
					>
						{ __( 'Learn more' ) }
					</ExternalLink>
				),
			}
		),
	},
	cls: {
		explanation: createInterpolateElement(
			/* translators: %(learnMore)s is the learn more link */
			__(
				'Cumulative Layout Shift is assessed by measuring how often content moves unexpectedly during loading. The best sites have a score of 0.1 or lower. <learnMore>Learn more</learnMore>'
			),
			{
				learnMore: (
					<ExternalLink
						href={ localizeUrl(
							'https://developer.wordpress.com/docs/site-performance/speed-test/#cumulative-layout-shift-cls-'
						) }
					>
						{ __( 'Learn more' ) }
					</ExternalLink>
				),
			}
		),
	},
	inp: {
		explanation: createInterpolateElement(
			/* translators: %(learnMore)s is the learn more link */
			__(
				'Interaction to Next Paint measures the overall responsiveness of a webpage by evaluating how quickly it reacts to user interactions. A good score is 200 milliseconds or less, indicating that the page responds swiftly to user inputs. <learnMore>Learn more</learnMore>'
			),
			{
				learnMore: (
					<ExternalLink
						href={ localizeUrl(
							'https://developer.wordpress.com/docs/site-performance/speed-test/#interaction-to-next-paint-inp-'
						) }
					>
						{ __( 'Learn more' ) }
					</ExternalLink>
				),
			}
		),
	},
	ttfb: {
		explanation: createInterpolateElement(
			/* translators: %(learnMore)s is the learn more link */
			__(
				'Time to First Byte reflects the time taken for a user‘s browser to receive the first byte of data from the server after making a request. The best sites load around 800 milliseconds or less. <learnMore>Learn more</learnMore>'
			),
			{
				learnMore: (
					<ExternalLink
						href={ localizeUrl(
							'https://developer.wordpress.com/docs/site-performance/speed-test/#time-to-first-byte-ttfb-'
						) }
					>
						{ __( 'Learn more' ) }
					</ExternalLink>
				),
			}
		),
	},
	tbt: {
		explanation: createInterpolateElement(
			/* translators: %(learnMore)s is the learn more link */
			__(
				'Total Blocking Time measures the total amount of time that a page is blocked from responding to user input, such as mouse clicks, screen taps, or keyboard presses. The best sites have a wait time of less than 200 milliseconds. <learnMore>Learn more</learnMore>'
			),
			{
				learnMore: (
					<ExternalLink
						href={ localizeUrl(
							'https://developer.wordpress.com/docs/site-performance/speed-test/#total-blocking-time-tbt-'
						) }
					>
						{ __( 'Learn more' ) }
					</ExternalLink>
				),
			}
		),
	},
	overall_score: {
		explanation: createInterpolateElement(
			/* translators: %(learnMore)s is the learn more link */
			__(
				'The performance score is a combined representation of your site‘s individual speed metrics. <learnMore>Learn more</learnMore>'
			),
			{
				learnMore: (
					<ExternalLink
						href={ localizeUrl(
							'https://developer.wordpress.com/docs/site-performance/speed-test/#performance-score'
						) }
					>
						{ __( 'Learn more' ) }
					</ExternalLink>
				),
			}
		),
	},
};

export default function CoreMetricsExplanation( { activeTab }: { activeTab: Metrics } ) {
	return (
		<Text style={ { maxWidth: '500px' } } variant="muted">
			{ metricsExplanations[ activeTab ].explanation }
		</Text>
	);
}
