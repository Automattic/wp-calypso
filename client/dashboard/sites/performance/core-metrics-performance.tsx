import { Metrics } from '@automattic/api-core';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Notice } from '../../components/notice';
import { getPerformanceStatus } from '../../utils/site-performance';

export default function CoreMetricsPerformance( {
	value,
	onRecommendationsFilterChange,
}: {
	value: number;
	onRecommendationsFilterChange: ( filter: Metrics ) => void;
} ) {
	const status = getPerformanceStatus( value );
	const score = Math.floor( value * 100 );
	const formattedScore = `${ score }/100`;

	const RecommendationLink = (
		<Button variant="link" onClick={ () => onRecommendationsFilterChange( 'overall_score' ) } />
	);

	if ( status === 'bad' ) {
		return (
			<Notice
				title={ sprintf(
					/* translators: %s is the performance score */
					__( 'Performance issues detected — %s' ),
					formattedScore
				) }
				variant="error"
			>
				{ createInterpolateElement(
					__(
						'Your site may feel slow or unresponsive. Start with the <recommendationsLink>top recommendations</recommendationsLink> to make the biggest impact.'
					),
					{
						recommendationsLink: RecommendationLink,
					}
				) }
			</Notice>
		);
	} else if ( status === 'needsImprovement' ) {
		return (
			<Notice
				title={ sprintf(
					/* translators: %s is the performance score */
					__( 'Needs improvement — %s' ),
					formattedScore
				) }
				variant="warning"
			>
				{ createInterpolateElement(
					__(
						'This page could be faster and more efficient. <recommendationsLink>Review the recommendations</recommendationsLink> to boost your score.'
					),
					{
						recommendationsLink: RecommendationLink,
					}
				) }
			</Notice>
		);
	}

	return (
		<Notice
			title={ sprintf(
				/* translators: %s is the performance score */ __( 'Great performance — %s' ),
				formattedScore
			) }
			variant="success"
		>
			{ createInterpolateElement(
				__(
					'This page is running smoothly. Keep it up! <recommendationsLink>Review recommendations</recommendationsLink> to stay ahead of best practices.'
				),
				{
					recommendationsLink: RecommendationLink,
				}
			) }
		</Notice>
	);
}
