import { calculateMonthlyPriceForPlan, getPlan, Plan } from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import { useEffect, useState } from '@wordpress/element';
import { sprintf, __, getLocaleData } from '@wordpress/i18n';
import i18n from 'i18n-calypso';
import config from '../config';
import { ApiPricingPlan } from '../types.js';

/**
 * This URL is broken down into parts due to 119-gh-Automattic/lighthouse-forums
 */
const PLANS_API_URL =
	'https' + '://' + 'public-api.wordpress.com/rest/v1.5/plans?locale=' + config.locale;

export interface BlockPlan extends Plan {
	productSlug: string;
	pathSlug: string;
	rawPrice: number;
	price: string;
	upgradeLabel: string;
}

const parsePlans = ( data: ApiPricingPlan[] ): BlockPlan[] => {
	return data
		.filter( ( apiPlan ) => config.plans.includes( apiPlan.product_slug ) )
		.map( ( apiPlan ): BlockPlan => {
			const plan: Plan = getPlan( apiPlan.product_slug ) as Plan;
			return {
				...plan,
				productSlug: apiPlan.product_slug,
				pathSlug: apiPlan.path_slug,
				rawPrice: apiPlan.raw_price,
				price:
					formatCurrency(
						calculateMonthlyPriceForPlan( apiPlan.product_slug, apiPlan.raw_price ),
						apiPlan.currency_code,
						{ stripZeros: true }
					) ?? '',
				upgradeLabel: sprintf(
					// translators: %s is the plan name
					__( 'Upgrade to %s', 'happy-blocks' ),
					plan.getTitle()
				),
			};
		} );
};

/**
 *  This hook is used to fetch the plans data from the API and return a data structure to use through
 *  the rest of the block's component tree.
 */
const usePricingPlans = () => {
	const [ plans, setPlans ] = useState< BlockPlan[] >( [] );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ error, setError ] = useState< unknown >( null );

	useEffect( () => {
		const fetchPlans = async () => {
			setIsLoading( true );
			setError( null );
			try {
				const response = await fetch( PLANS_API_URL );
				const data = await response.json();
				setPlans( parsePlans( data ) );
				i18n.addTranslations( getLocaleData( 'happy-blocks' ) );
			} catch ( e: unknown ) {
				setError( e );
			} finally {
				setIsLoading( false );
			}
		};

		fetchPlans();
	}, [] );

	return { data: plans, isLoading, error };
};

export default usePricingPlans;
