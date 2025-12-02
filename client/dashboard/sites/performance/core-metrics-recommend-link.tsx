import { Metrics } from '@automattic/api-core';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';

export const CoreMetricsRecommendLink = ( {
	activeTab,
	count,
	onClick,
}: {
	activeTab: Metrics;
	count: number;
	onClick: ( filter: Metrics ) => void;
} ) => {
	const { recordTracksEvent } = useAnalytics();

	const handleClick = ( filter: Metrics ) => {
		recordTracksEvent( 'calypso_dashboard_performance_profiler_recommendations_link_click', {
			filter,
		} );
		onClick( filter );
	};

	if ( activeTab === 'overall_score' ) {
		return createInterpolateElement(
			__( '<recommendLink>View all recommendations</recommendLink>' ),
			{
				recommendLink: (
					<Button
						variant="secondary"
						size="compact"
						onClick={ () => handleClick( 'overall_score' ) }
					/>
				),
			}
		);
	}

	return createInterpolateElement(
		sprintf(
			/* translators: %d is the number of recommendations */
			_n(
				'<viewLink>View %d recommendation</viewLink>',
				'<viewLink>View %d recommendations</viewLink>',
				count
			),
			count
		),
		{
			viewLink: (
				<Button variant="secondary" size="compact" onClick={ () => handleClick( activeTab ) } />
			),
		}
	);
};
