import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { Metrics } from '../core-metrics';

type RecommendationsLinkProps = {
	activeTab: Metrics | null;
	recommendationsQuantity?: number;
	recommendationsRef?: React.RefObject< HTMLDivElement > | null;
	onRecommendationsFilterChange?: ( filter: string ) => void;
};

export const RecommendationsLink = ( {
	activeTab,
	recommendationsQuantity,
	recommendationsRef,
	onRecommendationsFilterChange,
}: RecommendationsLinkProps ) => {
	const { recordTracksEvent } = useAnalytics();

	const recordRecommendationsClickEvent = ( filter: string ) =>
		recordTracksEvent( 'calypso_performance_profiler_recommendations_link_click', {
			filter,
		} );

	const handleClick = ( filter: string ) => {
		recordRecommendationsClickEvent( filter );
		onRecommendationsFilterChange?.( filter );
		recommendationsRef?.current?.scrollIntoView( {
			behavior: 'smooth',
			block: 'start',
		} );
	};

	if ( activeTab === 'overall' ) {
		return createInterpolateElement(
			__( '<recommendLink>View all recommendations</recommendLink>' ),
			{
				recommendLink: (
					<Button variant="secondary" size="compact" onClick={ () => handleClick( 'all' ) } />
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
				recommendationsQuantity ?? 0
			),
			recommendationsQuantity ?? 0
		),
		{
			viewLink: (
				<Button
					variant="secondary"
					size="compact"
					onClick={ () => handleClick( activeTab ?? '' ) }
				/>
			),
		}
	);
};
