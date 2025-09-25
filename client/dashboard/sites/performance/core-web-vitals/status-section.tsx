import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import { useAnalytics } from '../../../app/analytics';
import { Valuation } from '../utils';
import { Metrics } from './index';

type StatusSectionProps = {
	value: Valuation;
	activeTab: Metrics | null;
	recommendationsQuantity?: number;
	recommendationsRef?: React.RefObject< HTMLDivElement > | null;
	onRecommendationsFilterChange?: ( filter: string ) => void;
};

export const StatusSection = ( props: StatusSectionProps ) => {
	const {
		value,
		recommendationsQuantity,
		recommendationsRef,
		activeTab,
		onRecommendationsFilterChange,
	} = props;
	const { recordTracksEvent } = useAnalytics();

	const getStatus = ( value: Valuation ) => {
		if ( value === 'bad' ) {
			return 'poor';
		} else if ( value === 'needsImprovement' ) {
			return 'neutral';
		}
		return 'good';
	};
	const status = getStatus( value );
	const statusText = {
		poor: __( 'Poor' ),
		neutral: __( 'Needs improvement' ),
		good: __( 'Excellent' ),
	}[ status ];

	const recordRecommendationsClickEvent = ( filter: string ) =>
		recordTracksEvent( 'calypso_performance_profiler_recommendations_link_click', {
			filter,
		} );

	const getRecommendationsText = () => {
		if ( activeTab === 'overall' ) {
			return createInterpolateElement(
				__( '<recommendLink>View all recommendations</recommendLink>' ),
				{
					recommendLink: (
						/* eslint-disable-next-line jsx-a11y/anchor-is-valid */
						<Button
							variant="link"
							className="button"
							role="button"
							tabIndex={ 0 }
							onClick={ () => {
								recordRecommendationsClickEvent( 'all' );
								onRecommendationsFilterChange?.( '' );
								recommendationsRef?.current?.scrollIntoView( {
									behavior: 'smooth',
									block: 'start',
								} );
							} }
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
					recommendationsQuantity ?? 0
				),
				recommendationsQuantity ?? 0
			),
			{
				viewLink: (
					<Button
						variant="link"
						className="button"
						role="button"
						tabIndex={ 0 }
						onClick={ () => {
							recordRecommendationsClickEvent( activeTab ?? '' );
							onRecommendationsFilterChange?.( activeTab ?? '' );
							recommendationsRef?.current?.scrollIntoView( {
								behavior: 'smooth',
								block: 'start',
							} );
						} }
					/>
				),
			}
		);
	};

	return (
		<div className="status-section">
			<div className={ clsx( 'status-badge', { [ status ]: true } ) }>{ statusText }</div>
			{ !! recommendationsQuantity && (
				<div className="recommendations-text">{ getRecommendationsText() }</div>
			) }
		</div>
	);
};
