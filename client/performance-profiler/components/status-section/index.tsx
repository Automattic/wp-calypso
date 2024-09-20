import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { Metrics } from 'calypso/data/site-profiler/types';
import { Valuation } from 'calypso/performance-profiler/types/performance-metrics';

import './style.scss';

type StatusSectionProps = {
	value: Valuation;
	activeTab: Metrics | null;
	recommendationsQuantity?: number;
	recommendationsRef?: React.RefObject< HTMLDivElement > | null;
	onRecommendationsFilterChange?: ( filter: string ) => void;
};

export const StatusSection = ( props: StatusSectionProps ) => {
	const translate = useTranslate();

	const {
		value,
		recommendationsQuantity,
		recommendationsRef,
		activeTab,
		onRecommendationsFilterChange,
	} = props;
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
		poor: translate( 'Poor' ),
		neutral: translate( 'Needs improvement' ),
		good: translate( 'Excellent' ),
	}[ status ];

	return (
		<div className="status-section">
			<div className={ clsx( 'status-badge', { [ status ]: true } ) }>{ statusText }</div>
			{ !! recommendationsQuantity && (
				<div className="recommendations-text">
					{ activeTab === 'overall'
						? translate( '{{a}}View all recommendations{{/a}}', {
								components: {
									a: (
										/* eslint-disable-next-line jsx-a11y/anchor-is-valid */
										<Button
											variant="link"
											style={ { textDecoration: 'none' } }
											role="button"
											tabIndex={ 0 }
											onClick={ () => {
												onRecommendationsFilterChange?.( '' );
												recommendationsRef?.current?.scrollIntoView( {
													behavior: 'smooth',
													block: 'start',
												} );
											} }
										/>
									),
								},
						  } )
						: translate(
								'{{a}}View %(quantity)d recommendation{{/a}}',
								'{{a}}View %(quantity)d recommendations{{/a}}',
								{
									count: recommendationsQuantity,
									args: { quantity: recommendationsQuantity },
									components: {
										a: (
											/* eslint-disable-next-line jsx-a11y/anchor-is-valid */
											<Button
												variant="link"
												style={ { textDecoration: 'none' } }
												role="button"
												tabIndex={ 0 }
												onClick={ () => {
													onRecommendationsFilterChange?.( activeTab ?? '' );
													recommendationsRef?.current?.scrollIntoView( {
														behavior: 'smooth',
														block: 'start',
													} );
												} }
											/>
										),
									},
								}
						  ) }
				</div>
			) }
		</div>
	);
};
