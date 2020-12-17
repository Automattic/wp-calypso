/**
 * External dependencies
 */
import React from 'react';
import { useI18n } from '@automattic/react-i18n';
import { useSelect } from '@wordpress/data';
import { Button } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { PLANS_STORE } from '../constants';

/**
 * Style dependencies
 */
import './style.scss';

const TickIcon = <Icon icon={ check } size={ 25 } />;

type Props = {
	onSelect: ( storeSlug: string ) => void;
	locale: string;
};

const PlansDetails: React.FunctionComponent< Props > = ( { onSelect, locale } ) => {
	const { __ } = useI18n();

	const { features, featuresByType, plans } = useSelect( ( select ) =>
		select( PLANS_STORE ).getPlansDetails( locale )
	);

	const prices = useSelect( ( select ) => select( PLANS_STORE ).getPrices( locale ) );
	const supportedPlans = useSelect( ( select ) => select( PLANS_STORE ).getSupportedPlans() );

	const isLoading = ! supportedPlans?.length;
	const placeholderPlans = [ 1, 2, 3, 4, 5 ];

	return (
		<div className="plans-details">
			<table className="plans-details__table">
				<thead>
					<tr className="plans-details__header-row">
						<th>{ __( 'Feature', __i18n_text_domain__ ) }</th>
						{ isLoading
							? placeholderPlans.map( ( placeholder ) => (
									<th key={ placeholder }>
										<span className="plans-details__placeholder">{ '' }</span>
									</th>
							  ) )
							: supportedPlans.map( ( plan ) => <th key={ plan.storeSlug }>{ plan.title }</th> ) }
					</tr>
				</thead>

				{ isLoading ? (
					<tbody>
						{ placeholderPlans.map( ( placeholder, i ) => (
							<tr className="plans-details__feature-row" key={ i }>
								<th key={ placeholder }>
									<span className="plans-details__placeholder plans-details__placeholder--wide">
										{ '' }
									</span>
								</th>
								{ placeholderPlans.map( ( j ) => (
									<td key={ j }></td>
								) ) }
							</tr>
						) ) }
					</tbody>
				) : (
					featuresByType.map( ( featureType ) => (
						<tbody key={ featureType.id }>
							{ featureType.name && (
								<tr className="plans-details__header-row">
									<th colSpan={ 6 }>{ featureType.name }</th>
								</tr>
							) }
							{ featureType.features?.map( ( feature: string, i ) => (
								<tr className="plans-details__feature-row" key={ i }>
									<th>{ features[ feature ].name }</th>
									{ supportedPlans.map( ( plan, j ) =>
										feature === 'storage' ? (
											<td key={ j }>{ plans[ plan.storeSlug ][ feature ] }</td>
										) : (
											<td key={ j }>
												{ plans[ plan.storeSlug ].featuresSlugs?.[ feature ] ? (
													<>
														{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
														<span className="hidden">
															{ __( 'Available', __i18n_text_domain__ ) }
														</span>
														{ TickIcon }
													</>
												) : (
													<>
														{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
														<span className="hidden">
															{ __( 'Unavailable', __i18n_text_domain__ ) }
														</span>
													</>
												) }
											</td>
										)
									) }
								</tr>
							) ) }
						</tbody>
					) )
				) }

				<tbody>
					<tr className="plans-details__header-row">
						<th colSpan={ 6 }>{ __( 'Sign up', __i18n_text_domain__ ) }</th>
					</tr>
					<tr className="plans-details__feature-row" key="price">
						<th>{ __( 'Monthly subscription (billed yearly)', __i18n_text_domain__ ) }</th>
						{ isLoading
							? placeholderPlans.map( ( placeholder ) => (
									<td key={ placeholder }>
										<span className="plans-details__placeholder">{ '' }</span>
									</td>
							  ) )
							: supportedPlans.map( ( plan ) => (
									<td key={ plan.storeSlug }>{ prices[ plan.storeSlug ] }</td>
							  ) ) }
					</tr>

					<tr className="plans-details__feature-row" key="cta">
						<th></th>
						{ isLoading
							? placeholderPlans.map( ( placeholder ) => (
									<td key={ placeholder }>
										<Button className="plans-details__select-button" isPrimary disabled>
											<span className="plans-details__placeholder plans-details__placeholder--narrow">
												{ '' }
											</span>
										</Button>{ ' ' }
									</td>
							  ) )
							: supportedPlans.map( ( plan ) => (
									<td key={ plan.storeSlug }>
										<Button
											className="plans-details__select-button"
											onClick={ () => {
												onSelect( plan.storeSlug );
											} }
											isPrimary
										>
											<span>{ __( 'Select', __i18n_text_domain__ ) }</span>
										</Button>
									</td>
							  ) ) }
					</tr>
				</tbody>
			</table>
		</div>
	);
};

export default PlansDetails;
