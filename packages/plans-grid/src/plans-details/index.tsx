import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { Icon, check, close } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import * as React from 'react';
import { PLANS_STORE } from '../stores';
import type { Plans } from '@automattic/data-stores';

import './style.scss';

const TickIcon = <Icon icon={ check } size={ 25 } />;
const CrossIcon = <Icon icon={ close } size={ 25 } />;

type Props = {
	onSelect: ( planProductId: number | undefined ) => void;
	billingPeriod: Plans.PlanBillingPeriod;
	locale: string;
};

const PlansDetails: React.FunctionComponent< Props > = ( { onSelect, locale, billingPeriod } ) => {
	const { __, hasTranslation } = useI18n();

	const { supportedPlans, planProducts, features, featuresByType } = useSelect( ( select ) => {
		const { getPlanProduct, getFeatures, getFeaturesByType, getSupportedPlans } =
			select( PLANS_STORE );
		const supportedPlans = getSupportedPlans( locale );
		const planProducts = supportedPlans.map( ( plan ) =>
			getPlanProduct( plan.periodAgnosticSlug, billingPeriod )
		);

		return {
			supportedPlans,
			planProducts,
			features: getFeatures( locale ),
			featuresByType: getFeaturesByType( locale ),
		};
	} );

	const isLoading = ! supportedPlans?.length;
	const placeholderPlans = [ 1, 2, 3, 4, 5 ];

	// @TODO: clean this up when translations are done and we don't need fallbackAnnualBillingLabel
	const newAnnualBillingLabel = __( 'Monthly price (billed yearly)', __i18n_text_domain__ );
	const fallbackAnnualBillingLabel = __(
		'Monthly subscription (billed yearly)',
		__i18n_text_domain__
	);
	const annualBillingLabel =
		locale === 'en' || hasTranslation?.( 'Monthly price (billed yearly)' )
			? newAnnualBillingLabel
			: fallbackAnnualBillingLabel;

	const monthlyBillingLabel = __( 'Monthly subscription', __i18n_text_domain__ );

	const annualNudgeTextAnnually = __( 'Included with annual plans', __i18n_text_domain__ );
	const annualNudgeTextMonthly = __( 'Only included with annual plans', __i18n_text_domain__ );

	return (
		<div className="plans-details">
			<table className="plans-details__table">
				<thead>
					<tr className="plans-details__header-row">
						<th>{ __( 'Feature', __i18n_text_domain__ ) }</th>
						{ isLoading
							? placeholderPlans.map( ( placeholder ) => (
									<th key={ placeholder }>
										<span className="plans-details__placeholder"></span>
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
									<span className="plans-details__placeholder plans-details__placeholder--wide"></span>
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
								<tr
									className={ classnames( 'plans-details__feature-row', {
										'plans-details__feature-row--enabled':
											features[ feature ].requiresAnnuallyBilledPlan &&
											billingPeriod === 'ANNUALLY',
										'plans-details__feature-row--disabled':
											features[ feature ].requiresAnnuallyBilledPlan &&
											billingPeriod !== 'ANNUALLY',
									} ) }
									key={ i }
								>
									<th>
										{ features[ feature ].requiresAnnuallyBilledPlan && (
											<span
												className="plans-details__feature-annual-nudge"
												aria-label={
													billingPeriod === 'ANNUALLY'
														? annualNudgeTextAnnually
														: annualNudgeTextMonthly
												}
											>
												{ __( 'Included with annual plans', __i18n_text_domain__ ) }
											</span>
										) }
										<span>{ features[ feature ].name }</span>
									</th>
									{ supportedPlans.map( ( plan, j ) =>
										feature === 'storage' ? (
											<td key={ j }>{ plan.storage }</td>
										) : (
											<td key={ j }>
												{ plan.featuresSlugs?.[ feature ] ? (
													<>
														{ features[ feature ].requiresAnnuallyBilledPlan &&
														billingPeriod !== 'ANNUALLY' ? (
															<>
																{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
																<span className="hidden">
																	{ __( 'Unavailable', __i18n_text_domain__ ) }
																</span>
																{ CrossIcon }
															</>
														) : (
															<>
																{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
																<span className="hidden">
																	{ __( 'Available', __i18n_text_domain__ ) }
																</span>
																{ TickIcon }
															</>
														) }
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
						<th>{ billingPeriod === 'ANNUALLY' ? annualBillingLabel : monthlyBillingLabel }</th>
						{ isLoading
							? placeholderPlans.map( ( placeholder ) => (
									<td key={ placeholder }>
										<span className="plans-details__placeholder"></span>
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
											<span className="plans-details__placeholder plans-details__placeholder--narrow"></span>
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
