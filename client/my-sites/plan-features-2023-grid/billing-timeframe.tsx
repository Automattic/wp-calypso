import {
	isWpComFreePlan,
	isWpcomEnterpriseGridPlan,
	PLAN_BIENNIAL_PERIOD,
	PLAN_ANNUAL_PERIOD,
} from '@automattic/calypso-products';
import { getCurrencyObject } from '@automattic/format-currency';
import { localize, TranslateResult, useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';

interface Props {
	planName: string;
	billingTimeframe: TranslateResult;
	billingPeriod: number | null | undefined;
	rawPrice: number | null;
	maybeDiscountedFullTermPrice: number | null;
	annualPricePerMonth: number | null;
	isMonthlyPlan: boolean;
}

function usePerMonthDescription( {
	rawPrice,
	maybeDiscountedFullTermPrice,
	annualPricePerMonth,
	isMonthlyPlan,
	planName,
	billingPeriod,
}: Omit< Props, 'billingTimeframe' > ) {
	const translate = useTranslate();
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	if ( isWpComFreePlan( planName ) || isWpcomEnterpriseGridPlan( planName ) ) {
		return null;
	}

	if ( isMonthlyPlan ) {
		if ( null !== rawPrice && null !== annualPricePerMonth ) {
			if ( annualPricePerMonth < rawPrice ) {
				return translate( `Save %(discountRate)s%% by paying annually`, {
					args: {
						discountRate: Math.round( ( 100 * ( rawPrice - annualPricePerMonth ) ) / rawPrice ),
					},
				} );
			}
		}
	}

	if ( ! isMonthlyPlan ) {
		const fullTermPriceObj =
			currencyCode && null !== maybeDiscountedFullTermPrice
				? getCurrencyObject( maybeDiscountedFullTermPrice, currencyCode )
				: null;
		const fullTermPriceText = `${ fullTermPriceObj?.symbol }${ fullTermPriceObj?.integer }`;

		if ( PLAN_ANNUAL_PERIOD === billingPeriod ) {
			return translate( 'per month, %(fullTermPriceText)s billed annually', {
				args: { fullTermPriceText },
			} );
		}

		if ( PLAN_BIENNIAL_PERIOD === billingPeriod ) {
			return translate( 'per month, %(fullTermPriceText)s billed every two years', {
				args: { fullTermPriceText },
			} );
		}
	}

	return null;
}

const PlanFeatures2023GridBillingTimeframe: FunctionComponent< Props > = ( props ) => {
	const { planName, billingTimeframe } = props;
	const translate = useTranslate();

	const perMonthDescription = usePerMonthDescription( props ) || billingTimeframe;

	if ( isWpcomEnterpriseGridPlan( planName ) ) {
		return (
			<div className="plan-features-2023-grid__vip-price">
				{ translate( 'Starts at {{b}}US$25,000{{/b}} yearly.', {
					components: { b: <b /> },
					comment: 'Translators: the price is in US dollars for all users (US$25,000)',
				} ) }
			</div>
		);
	}

	return <div>{ perMonthDescription }</div>;
};

export default localize( PlanFeatures2023GridBillingTimeframe );
