import {
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_ECOMMERCE_3_YEARS,
	PLAN_ECOMMERCE_MONTHLY,
	getPlan,
	getPlans,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { PlanPrice } from '@automattic/components';
import Card from '@automattic/components/src/card';
import { formatCurrency } from '@automattic/format-currency';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { CustomSelectControl } from '@wordpress/components';
import { hasTranslation } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useState } from 'react';
import './style.scss';
import { getTrialCheckoutUrl } from 'calypso/lib/trials/get-trial-checkout-url';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import UpgradeButton from '../../components/upgrade-button/upgrade-button';
import EcommerceTrialIncluded from '../../current-plan/trials/ecommerce-trial-included';

interface EntrepreneurPlanProps {
	hideTrialIncluded?: boolean;
}

interface PlanPriceType {
	term: string;
	slug: string;
	price?: number;
	montlyPrice?: number;
	subText?: ReactNode;
	discount?: number;
	discountText?: ReactNode;
}
type PlanKeys =
	| 'PLAN_ECOMMERCE'
	| 'PLAN_ECOMMERCE_2_YEARS'
	| 'PLAN_ECOMMERCE_3_YEARS'
	| 'PLAN_ECOMMERCE_MONTHLY';

const useEntrepreneurPlanPrices = () => {
	const translate = useTranslate();
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) || '';
	const state = useSelector( ( stateValue ) => stateValue );
	const rawPlans = getPlans();

	const baseMontlyPrice =
		getPlanRawPrice( state, rawPlans[ PLAN_ECOMMERCE_MONTHLY ].getProductId(), false ) || 0;

	const planPrices: Record< PlanKeys, PlanPriceType > = {
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
	const keys = Object.keys( planPrices ) as PlanKeys[];
	keys.forEach( ( key ) => {
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
					args: {
						rawPrice: formatCurrency( plan.price, currencyCode, {
							stripZeros: true,
							isSmallestUnit: false,
						} ),
					},
					comment: 'Excl. Taxes is short for excluding taxes',
				} );
				break;
			case 'PLAN_ECOMMERCE_2_YEARS':
				plan.subText = translate( 'per month, %(rawPrice)s billed every two years, excl. taxes', {
					args: {
						rawPrice: formatCurrency( plan.price, currencyCode, {
							stripZeros: true,
							isSmallestUnit: false,
						} ),
					},
					comment: 'Excl. Taxes is short for excluding taxes',
				} );
				break;
			case 'PLAN_ECOMMERCE_3_YEARS':
				plan.subText = translate( 'per month, %(rawPrice)s billed every three years, excl. taxes', {
					args: {
						rawPrice: formatCurrency( plan.price, currencyCode, {
							stripZeros: true,
							isSmallestUnit: false,
						} ),
					},
					comment: 'Excl. Taxes is short for excluding taxes',
				} );
				break;
		}
	} );

	return planPrices;
};

export function EntrepreneurPlan( props: EntrepreneurPlanProps ) {
	const { hideTrialIncluded } = props;
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const plans = useEntrepreneurPlanPrices();
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const isEnglish = useIsEnglishLocale();
	const [ selectedInterval, setSelectedInterval ] = useState< PlanKeys >( 'PLAN_ECOMMERCE' );
	const selectedPlan = plans[ selectedInterval ];

	const keys = Object.keys( plans ) as PlanKeys[];
	const selectControlOptions = keys.map( ( key ) => {
		const plan = plans[ key ];
		return {
			key,
			name: (
				<div>
					{ plan.term } { plan.discountText && <span>{ plan.discountText }</span> }
				</div>
			),
		};
	} );

	const upgradeClick = () => {
		if ( selectedSite?.slug ) {
			const checkoutUrl = getTrialCheckoutUrl( {
				productSlug: selectedPlan.slug,
				siteSlug: selectedSite.slug,
			} );

			page.redirect( checkoutUrl );
		}
	};

	const onSelectChange = ( { selectedItem: { key } }: { selectedItem: { key: PlanKeys } } ) => {
		setSelectedInterval( key );
	};

	const hasNewTitleTranslation = hasTranslation( "What's included in your free trial:" );
	const titleTranslation =
		isEnglish || hasNewTitleTranslation
			? translate( "What's included in your free trial:" )
			: translate( "What's included in your free trial" );

	return (
		<>
			{ ! hideTrialIncluded && (
				<>
					<h2 className="entrepreneur-trial-plan__section-title">{ titleTranslation }</h2>
					<div className="entrepreneur-trial-plan__included-wrapper">
						<EcommerceTrialIncluded displayAll />
					</div>
				</>
			) }
			<div className="plan-heading">
				<h2 className="entrepreneur-trial-plan__section-title">
					{ translate( 'Keep all the features for your site' ) }
				</h2>
				<CustomSelectControl
					options={ selectControlOptions }
					className="period-select"
					hideLabelFromVision
					onChange={ onSelectChange }
				/>
			</div>
			<Card>
				<div className="plan-wrapper">
					<div className="plan-description">
						<h3 className="entrepreneur-trial-plan__plan-title">
							{ getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '' }
						</h3>
						<p className="card-text">
							{ isEnglish ||
							hasTranslation(
								"Secure the full benefits of the %(planName)s plan. Purchase today and maximize your store's potential!"
							)
								? // translators: %(planName)s is a plan name. E.g. Commerce plan.
								  translate(
										"Secure the full benefits of the %(planName)s plan. Purchase today and maximize your store's potential!",
										{
											args: {
												planName: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
											},
										}
								  )
								: translate(
										"Secure the full benefits of the Entrepreneur plan. Purchase today and maximize your store's potential!"
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
