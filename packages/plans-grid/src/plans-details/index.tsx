/**
 * External dependencies
 */
import React from 'react';
import { __ } from '@wordpress/i18n';
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
};

const PlansDetails: React.FunctionComponent< Props > = ( { onSelect } ) => {
	const plansDetails = useSelect( ( select ) => select( PLANS_STORE ).getPlansDetails() );
	const prices = useSelect( ( select ) => select( PLANS_STORE ).getPrices() );
	const supportedPlans = useSelect( ( select ) => select( PLANS_STORE ).getSupportedPlans() );

	return (
		<div className="plans-details">
			<table className="plans-details__table">
				<thead>
					<tr className="plans-details__header-row">
						<th>{ __( 'Feature', __i18n_text_domain__ ) }</th>
						{ supportedPlans.map( ( plan ) => (
							<th key={ plan.storeSlug }>{ plan.title }</th>
						) ) }
					</tr>
				</thead>
				{ plansDetails.map( ( detail ) => (
					<tbody key={ detail.id }>
						{ detail.name && (
							<tr className="plans-details__header-row">
								<th colSpan={ 6 }>{ detail.name }</th>
							</tr>
						) }
						{ detail.features.map( ( feature, i ) => (
							<tr className="plans-details__feature-row" key={ i }>
								<th>{ feature.name }</th>
								{ feature.data.map( ( value, j ) => (
									<td key={ j }>
										{ feature.type === 'checkbox' &&
											( value ? (
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
														{ __( 'Unavailable', __i18n_text_domain__ ) }{ ' ' }
													</span>
												</>
											) ) }
										{ feature.type === 'text' && value }
									</td>
								) ) }
							</tr>
						) ) }
					</tbody>
				) ) }

				<tbody>
					<tr className="plans-details__header-row">
						<th colSpan={ 6 }>{ __( 'Sign up', __i18n_text_domain__ ) }</th>
					</tr>
					<tr className="plans-details__feature-row" key="price">
						<th>{ __( 'Monthly subscription (billed yearly)', __i18n_text_domain__ ) }</th>
						{ supportedPlans.map( ( plan ) => (
							<td key={ plan.storeSlug }>{ prices[ plan.storeSlug ] }</td>
						) ) }
					</tr>

					<tr className="plans-details__feature-row" key="cta">
						<th></th>
						{ supportedPlans.map( ( plan ) => (
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
