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
import useBillingPeriod from '../hooks/use-billing-period';

/**
 * Style dependencies
 */
import './style.scss';

const TickIcon = <Icon icon={ check } size={ 25 } />;

type Props = {
	onSelect: ( planProductId: number | undefined ) => void;
	locale: string;
};

const PlansDetails: React.FunctionComponent< Props > = ( { onSelect, locale } ) => {
	const { __ } = useI18n();

	const features = useSelect( ( select ) => select( PLANS_STORE ).getFeatures() );
	const featuresByType = useSelect( ( select ) => select( PLANS_STORE ).getFeaturesByType() );
	const supportedPlans = useSelect( ( select ) =>
		select( PLANS_STORE ).getSupportedPlans( locale )
	);

	const billingPeriod = useBillingPeriod();
	const planProducts = useSelect( ( select ) =>
		supportedPlans.map( ( plan ) =>
			select( PLANS_STORE ).getPlanProduct( plan.periodAgnosticSlug, billingPeriod )
		)
	);

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
							: supportedPlans.map( ( plan ) => (
									<th key={ plan.periodAgnosticSlug }>{ plan.title }</th>
							  ) ) }
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
											<td key={ j }>{ plan.storage }</td>
										) : (
											<td key={ j }>
												{ plan.featuresSlugs?.[ feature ] ? (
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
							: supportedPlans.map( ( plan, i ) => (
									<td key={ plan.periodAgnosticSlug }>{ planProducts[ i ]?.price }</td>
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
							: supportedPlans.map( ( plan, i ) => (
									<td key={ plan.periodAgnosticSlug }>
										<Button
											className="plans-details__select-button"
											onClick={ () => {
												onSelect( planProducts[ i ]?.productId );
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
