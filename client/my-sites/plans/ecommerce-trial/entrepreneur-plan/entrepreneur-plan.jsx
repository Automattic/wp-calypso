import {
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_ECOMMERCE_3_YEARS,
	PLAN_ECOMMERCE_MONTHLY,
	getPlans,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { PlanPrice } from '@automattic/components';
import Card from '@automattic/components/src/card';
import { CustomSelectControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import './style.scss';
import { getTrialCheckoutUrl } from 'calypso/lib/trials/get-trial-checkout-url';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import UpgradeButton from '../../components/upgrade-button/upgrade-button';
import EcommerceTrialIncluded from '../../current-plan/trials/ecommerce-trial-included';

const useEntrepreneurPlanPrices = () => {
	const translate = useTranslate();
	const state = useSelector( ( stateValue ) => stateValue );
	const rawPlans = getPlans();

	const baseMontlyPrice =
		getPlanRawPrice( state, rawPlans[ PLAN_ECOMMERCE_MONTHLY ].getProductId(), false ) || 0;

	const planPrices = {
		PLAN_ECOMMERCE: {
			term: translate( 'Pay yearly' ),
			slug: PLAN_ECOMMERCE,
		},
		PLAN_ECOMMERCE_2_YEARS: {
			term: translate( 'Pay every 2 years' ),
			slug: PLAN_ECOMMERCE_2_YEARS,
		},
		PLAN_ECOMMERCE_3_YEARS: {
			term: translate( 'Pay every 3 years' ),
			slug: PLAN_ECOMMERCE_3_YEARS,
		},
		PLAN_ECOMMERCE_MONTHLY: {
			term: translate( 'Pay monthly' ),
			slug: PLAN_ECOMMERCE_MONTHLY,
			price: baseMontlyPrice,
			montlyPrice: baseMontlyPrice,
			subText: translate( 'per month, excl. taxes', {
				args: { rawPrice: baseMontlyPrice },
				comment: 'Excl. Taxes is short for excluding taxes',
			} ),
		},
	};

	Object.keys( planPrices ).forEach( ( key ) => {
		if ( key === 'PLAN_ECOMMERCE_MONTHLY' ) {
			return;
		}
		const plan = planPrices[ key ];
		plan.price = getPlanRawPrice( state, rawPlans[ plan.slug ].getProductId(), false ) || 0;
		plan.montlyPrice = getPlanRawPrice( state, rawPlans[ plan.slug ].getProductId(), true ) || 0;
		plan.discount = Math.floor( ( 1 - plan.montlyPrice / baseMontlyPrice ) * 100 );
		plan.discountText = translate( '%(discount)d%% off', {
			args: { discount: plan.discount },
			comment: '%discount is a number representing a discount percentage on a plan price',
		} );
		switch ( key ) {
			case 'PLAN_ECOMMERCE':
				plan.subText = translate( 'per month, %(rawPrice)s billed annually, excl. taxes', {
					args: { rawPrice: plan.price },
					comment: 'Excl. Taxes is short for excluding taxes',
				} );
				break;
			case 'PLAN_ECOMMERCE_2_YEARS':
				plan.subText = translate( 'per month, %(rawPrice)s billed every two years, excl. taxes', {
					args: { rawPrice: plan.price },
					comment: 'Excl. Taxes is short for excluding taxes',
				} );
				break;
			case 'PLAN_ECOMMERCE_3_YEARS':
				plan.subText = translate( 'per month, %(rawPrice)s billed every three years, excl. taxes', {
					args: { rawPrice: plan.price },
					comment: 'Excl. Taxes is short for excluding taxes',
				} );
				break;
		}
	} );

	return planPrices;
};

export function EntrepreneurPlan() {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const plans = useEntrepreneurPlanPrices();
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const [ selectedInterval, setSelectedInterval ] = useState( 'PLAN_ECOMMERCE' );
	const selectedPlan = plans[ selectedInterval ];

	const selectControlOptions = Object.keys( plans ).map( ( key ) => {
		const plan = plans[ key ];
		return {
			key,
			name: (
				<div>
					{ plan.term } <span>{ plan.discountText }</span>
				</div>
			),
		};
	} );

	const upgradeClick = () => {
		const checkoutUrl = getTrialCheckoutUrl( {
			productSlug: selectedPlan.slug,
			siteSlug: selectedSite.slug,
		} );

		page.redirect( checkoutUrl );
	};

	return (
		<>
			<h2 className="entrepreneur-trial-plan__section-title">
				{ translate( "What's included in your free trial" ) }
			</h2>
			<div className="entrepreneur-trial-plan__included-wrapper">
				<EcommerceTrialIncluded displayAll={ true } />
			</div>
			<div className="plan-heading">
				<h2 className="entrepreneur-trial-plan__section-title">
					{ translate( 'Keep all the features for your site' ) }
				</h2>
				<CustomSelectControl
					options={ selectControlOptions }
					className="period-select"
					hideLabelFromVision
					onChange={ ( { selectedItem: { key } } ) => {
						setSelectedInterval( key );
					} }
				/>
			</div>
			<Card>
				<div className="plan-wrapper">
					<div className="plan-description">
						<h3 className="entrepreneur-trial-plan__plan-title">{ translate( 'Entrepreneur' ) }</h3>
						<p className="card-text">
							{ translate(
								"Continue enjoying the full benefits of Entrepreneur plan, simply add your payment method and maximize your store's potential."
							) }
						</p>
					</div>
					<div className="price-block">
						<PlanPrice rawPrice={ selectedPlan.montlyPrice } currencyCode={ currencyCode } />
						<p className="card-text">{ selectedPlan.subText }</p>
					</div>
				</div>
				<UpgradeButton goToCheckoutWithPlan={ upgradeClick } isEntrepreneurTrial />
			</Card>
		</>
	);
}
