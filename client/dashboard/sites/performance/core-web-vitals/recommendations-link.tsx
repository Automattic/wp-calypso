import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { Metrics } from '../utils';

export const RecommendationsLink = ( {
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
		recordTracksEvent( 'calypso_performance_profiler_recommendations_link_click', {
			filter,
		} );
		onClick( filter );
	};

	if ( activeTab === 'overall' ) {
		return createInterpolateElement(
			__( '<recommendLink>View all recommendations</recommendLink>' ),
			{
				recommendLink: (
					<Button variant="secondary" size="compact" onClick={ () => handleClick( 'overall' ) } />
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
				count ?? 0
			),
			count ?? 0
		),
		{
			viewLink: (
				<Button variant="secondary" size="compact" onClick={ () => handleClick( activeTab ) } />
			),
		}
	);
};
